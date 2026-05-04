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
  Select
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { userApi } from '../services/api';

const { Search } = Input;
const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchStatus, setSearchStatus] = useState(undefined);

  useEffect(() => {
    loadUsers();
  }, [pagination.current, pagination.pageSize]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
      };
      if (searchKeyword) params.keyword = searchKeyword;
      if (searchStatus !== undefined) params.status = searchStatus;

      const res = await userApi.getList(params);
      setUsers(res.data?.list || []);
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

  const handleStatusChange = async (record) => {
    try {
      const newStatus = record.status === 1 ? 0 : 1;
      await userApi.updateStatus(record.id, newStatus);
      message.success(`已${newStatus === 1 ? '启用' : '禁用'}该用户`);
      loadUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(loadUsers, 100);
  };

  const handleReset = () => {
    setSearchKeyword('');
    setSearchStatus(undefined);
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(loadUsers, 100);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      render: (val) => `¥${val}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title={`确定要${record.status === 1 ? '禁用' : '启用'}该用户吗？`}
            onConfirm={() => handleStatusChange(record)}
          >
            <Button type="link" size="small">
              {record.status === 1 ? '禁用' : '启用'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="用户管理"
        extra={
          <Space>
            <Search
              placeholder="搜索用户名/邮箱"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
            <Select
              placeholder="状态筛选"
              value={searchStatus}
              onChange={(val) => setSearchStatus(val)}
              style={{ width: 120 }}
              allowClear
            >
              <Option value={1}>正常</Option>
              <Option value={0}>禁用</Option>
            </Select>
            <Button onClick={handleSearch} type="primary">
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
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
    </div>
  );
};

export default UserManagement;
