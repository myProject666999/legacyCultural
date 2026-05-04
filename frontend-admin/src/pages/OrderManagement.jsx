import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Space,
  Popconfirm,
  Descriptions,
  Select,
  Image
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { orderApi } from '../services/api';

const { Option } = Select;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchStatus, setSearchStatus] = useState(undefined);

  useEffect(() => {
    loadOrders();
  }, [pagination.current, pagination.pageSize, searchStatus]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
      };
      if (searchStatus !== undefined) params.status = searchStatus;

      const res = await orderApi.getList(params);
      setOrders(res.data?.list || []);
      setPagination(prev => ({
        ...prev,
        total: res.data?.total || 0,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (record) => {
    try {
      const res = await orderApi.getDetail(record.id);
      setCurrentOrder(res.data);
      setDetailModalVisible(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await orderApi.updateStatus(id, status);
      message.success('更新成功');
      loadOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const statusMap = {
    pending: { text: '待支付', color: 'orange' },
    paid: { text: '已支付', color: 'green' },
    shipped: { text: '已发货', color: 'blue' },
    delivered: { text: '已送达', color: 'default' },
    cancelled: { text: '已取消', color: 'red' },
  };

  const getStatusOptions = (currentStatus) => {
    const transitions = {
      pending: ['paid', 'cancelled'],
      paid: ['shipped', 'cancelled'],
      shipped: ['delivered'],
    };
    return transitions[currentStatus] || [];
  };

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'order_no',
      key: 'order_no',
    },
    {
      title: '用户',
      dataIndex: ['user', 'username'],
      key: 'user',
    },
    {
      title: '总金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (val) => `¥${val}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const info = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        const nextStatuses = getStatusOptions(record.status);
        return (
          <Space>
            <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
              <EyeOutlined /> 详情
            </Button>
            {nextStatuses.map(status => (
              <Button
                key={status}
                type="link"
                size="small"
                onClick={() => handleStatusChange(record.id, status)}
              >
                {statusMap[status]?.text || status}
              </Button>
            ))}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Card 
        title="订单管理"
        extra={
          <Space>
            <Select
              placeholder="状态筛选"
              value={searchStatus}
              onChange={(val) => setSearchStatus(val)}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="pending">待支付</Option>
              <Option value="paid">已支付</Option>
              <Option value="shipped">已发货</Option>
              <Option value="delivered">已送达</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize }));
            },
          }}
        />
      </Card>

      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentOrder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="订单编号">{currentOrder.order_no}</Descriptions.Item>
              <Descriptions.Item label="用户">{currentOrder.user?.username}</Descriptions.Item>
              <Descriptions.Item label="总金额">¥{currentOrder.total_amount}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[currentOrder.status]?.color}>
                  {statusMap[currentOrder.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>
                {new Date(currentOrder.created_at).toLocaleString()}
              </Descriptions.Item>
              {currentOrder.address_name && (
                <>
                  <Descriptions.Item label="收货人">{currentOrder.address_name}</Descriptions.Item>
                  <Descriptions.Item label="联系电话">{currentOrder.address_phone}</Descriptions.Item>
                  <Descriptions.Item label="收货地址" span={2}>
                    {currentOrder.address_detail}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <h4>订单商品</h4>
              <Table
                dataSource={currentOrder.items || []}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: '商品',
                    dataIndex: 'product_name',
                    key: 'product_name',
                  },
                  {
                    title: '单价',
                    dataIndex: 'price',
                    key: 'price',
                    render: (val) => `¥${val}`,
                  },
                  {
                    title: '数量',
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: '小计',
                    key: 'subtotal',
                    render: (_, record) => `¥${record.price * record.quantity}`,
                  },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;
