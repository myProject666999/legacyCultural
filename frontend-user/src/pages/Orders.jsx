import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, Descriptions, Image, Empty, message, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ShoppingOutlined } from '@ant-design/icons';
import { orderApi } from '../services/api';

const orderStatusMap = {
  0: { text: '待付款', color: 'default' },
  1: { text: '已付款', color: 'blue' },
  2: { text: '已发货', color: 'orange' },
  3: { text: '已完成', color: 'green' },
  4: { text: '已取消', color: 'red' },
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [pagination.current]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getList({
        page: pagination.current,
        page_size: pagination.pageSize,
      });
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

  const handleViewDetail = (order) => {
    setCurrentOrder(order);
    setDetailModalVisible(true);
  };

  const handleCancelOrder = async (order) => {
    try {
      await orderApi.updateStatus(order.id, 4);
      message.success('订单已取消');
      loadOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmReceive = async (order) => {
    try {
      await orderApi.updateStatus(order.id, 3);
      message.success('确认收货成功');
      loadOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'order_no',
      key: 'order_no',
      width: 200,
    },
    {
      title: '商品信息',
      key: 'items',
      render: (_, record) => {
        if (record.items?.length > 0) {
          const item = record.items[0];
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 50, height: 50, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.product?.image ? (
                  <Image src={item.product.image} width={50} height={50} style={{ objectFit: 'contain' }} preview={false} />
                ) : (
                  <ShoppingOutlined style={{ color: '#ccc' }} />
                )}
              </div>
              <div>
                <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.product?.name}
                </div>
                <div style={{ color: '#999', fontSize: 12 }}>
                  数量: {item.quantity} | 单价: ¥{item.price?.toFixed(2)}
                </div>
              </div>
            </div>
          );
        }
        return '-';
      },
    },
    {
      title: '订单金额',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (val) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{val?.toFixed(2)}</span>,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusInfo = orderStatusMap[status] || { text: '未知', color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '下单时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => new Date(val).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            查看详情
          </Button>
          {record.status === 0 && (
            <Popconfirm title="确定要取消该订单吗？" onConfirm={() => handleCancelOrder(record)}>
              <Button type="link" size="small" danger>取消订单</Button>
            </Popconfirm>
          )}
          {record.status === 2 && (
            <Button type="primary" size="small" onClick={() => handleConfirmReceive(record)}>
              确认收货
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card title="我的订单">
        {orders.length > 0 ? (
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showTotal: (total) => `共 ${total} 条订单`,
              onChange: (page, pageSize) => {
                setPagination(prev => ({ ...prev, current: page, pageSize }));
              },
            }}
          />
        ) : (
          <Empty description="暂无订单">
            <Button type="primary" onClick={() => navigate('/products')}>去购物</Button>
          </Empty>
        )}
      </Card>

      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>,
        ]}
        width={700}
      >
        {currentOrder && (
          <div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="订单编号">{currentOrder.order_no}</Descriptions.Item>
              <Descriptions.Item label="订单状态">
                {(() => {
                  const statusInfo = orderStatusMap[currentOrder.status] || { text: '未知', color: 'default' };
                  return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="订单金额" span={2}>
                <span style={{ color: '#ff4d4f', fontSize: 18, fontWeight: 'bold' }}>
                  ¥{currentOrder.total_price?.toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="下单时间">{new Date(currentOrder.created_at).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="支付时间">
                {currentOrder.payment_time ? new Date(currentOrder.payment_time).toLocaleString() : '未支付'}
              </Descriptions.Item>
            </Descriptions>

            <Card title="商品列表" size="small">
              {currentOrder.items?.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: index < currentOrder.items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <div style={{ width: 60, height: 60, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.product?.image ? (
                      <Image src={item.product.image} width={60} height={60} style={{ objectFit: 'contain' }} preview={false} />
                    ) : (
                      <ShoppingOutlined style={{ color: '#ccc', fontSize: 24 }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{item.product?.name}</div>
                    <div style={{ color: '#999', fontSize: 12 }}>数量: {item.quantity}</div>
                  </div>
                  <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                    ¥{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </Card>

            {currentOrder.address_info && (
              <Card title="收货地址" size="small" style={{ marginTop: 16 }}>
                <Descriptions column={1} size="small">
                  {(() => {
                    try {
                      const addr = JSON.parse(currentOrder.address_info);
                      return (
                        <>
                          <Descriptions.Item label="收货人">{addr.name} {addr.phone}</Descriptions.Item>
                          <Descriptions.Item label="收货地址">
                            {addr.province}{addr.city}{addr.district}{addr.detail}
                          </Descriptions.Item>
                        </>
                      );
                    } catch {
                      return <Descriptions.Item>{currentOrder.address_info}</Descriptions.Item>;
                    }
                  })()}
                </Descriptions>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
