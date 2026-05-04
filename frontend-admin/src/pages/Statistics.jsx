import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  DatePicker,
  Select,
  Button,
  Space
} from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  OrderedListOutlined
} from '@ant-design/icons';
import { statsApi, orderApi } from '../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Statistics = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_orders: 0,
    total_sales: 0,
    today_orders: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [period, setPeriod] = useState('day');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await statsApi.getDashboard();
      setStats(res.data || {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = { period };
      if (dateRange && dateRange.length === 2) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }

      const salesRes = await statsApi.getSales(params);
      setSalesData(salesRes.data || []);

      const usersRes = await statsApi.getUsers(params);
      setUsersData(usersRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const salesColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '订单数',
      dataIndex: 'order_count',
      key: 'order_count',
    },
    {
      title: '销售额',
      dataIndex: 'sales_amount',
      key: 'sales_amount',
      render: (val) => `¥${val}`,
    },
  ];

  const usersColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '新增用户数',
      dataIndex: 'user_count',
      key: 'user_count',
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.total_users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={stats.total_orders}
              prefix={<OrderedListOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总销售额"
              value={stats.total_sales}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日订单"
              value={stats.today_orders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="数据统计查询" style={{ marginBottom: 24 }}>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
          <Select
            value={period}
            onChange={(val) => setPeriod(val)}
            style={{ width: 120 }}
          >
            <Option value="day">按天</Option>
            <Option value="week">按周</Option>
            <Option value="month">按月</Option>
          </Select>
          <Button type="primary" onClick={handleSearch} loading={loading}>
            查询
          </Button>
        </Space>
      </Card>

      {salesData.length > 0 && (
        <Row gutter={16}>
          <Col span={12}>
            <Card title="销售统计">
              <Table
                dataSource={salesData}
                columns={salesColumns}
                rowKey="date"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="用户注册统计">
              <Table
                dataSource={usersData}
                columns={usersColumns}
                rowKey="date"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Statistics;
