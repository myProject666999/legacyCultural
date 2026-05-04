import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Tabs, 
  message, 
  List, 
  Avatar, 
  Modal,
  Tag,
  Popconfirm
} from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { userApi, addressApi } from '../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [infoForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [addressForm] = Form.useForm();

  useEffect(() => {
    loadUserInfo();
    loadAddresses();
  }, []);

  const loadUserInfo = async () => {
    try {
      const res = await userApi.getInfo();
      setUser(res.data);
      infoForm.setFieldsValue({
        email: res.data.email,
        phone: res.data.phone,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await addressApi.getList();
      setAddresses(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateInfo = async (values) => {
    setLoading(true);
    try {
      await userApi.updateInfo(values);
      message.success('更新成功');
      loadUserInfo();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      await userApi.updatePassword({
        old_password: values.old_password,
        new_password: values.new_password,
      });
      message.success('密码修改成功');
      passwordForm.resetFields();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    addressForm.resetFields();
    setAddressModalVisible(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    addressForm.setFieldsValue(address);
    setAddressModalVisible(true);
  };

  const handleDeleteAddress = async (id) => {
    try {
      await addressApi.delete(id);
      message.success('删除成功');
      loadAddresses();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveAddress = async (values) => {
    setLoading(true);
    try {
      if (editingAddress) {
        await addressApi.update(editingAddress.id, values);
        message.success('更新成功');
      } else {
        await addressApi.create(values);
        message.success('添加成功');
      }
      setAddressModalVisible(false);
      loadAddresses();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'info',
      label: '个人信息',
      children: (
        <div>
          <Card size="small" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <Avatar size={80} icon={<UserOutlined />} src={user?.avatar} />
              <div>
                <h2 style={{ margin: 0 }}>{user?.username}</h2>
                <div style={{ marginTop: 8 }}>
                  <Tag color="blue">余额: ¥{user?.balance?.toFixed(2) || '0.00'}</Tag>
                </div>
              </div>
            </div>
          </Card>

          <Form
            form={infoForm}
            layout="vertical"
            onFinish={handleUpdateInfo}
          >
            <Form.Item label="邮箱" name="email">
              <Input placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Item label="手机号" name="phone">
              <Input placeholder="请输入手机号" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: 'password',
      label: '修改密码',
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleUpdatePassword}
          style={{ maxWidth: 400 }}
        >
          <Form.Item
            label="原密码"
            name="old_password"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="new_password"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="confirm_password"
            rules={[{ required: true, message: '请再次输入新密码' }]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              修改密码
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'address',
      label: '收货地址',
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAddress}>
              添加地址
            </Button>
          </div>

          {addresses.length > 0 ? (
            <List
              dataSource={addresses}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditAddress(item)}>
                      编辑
                    </Button>,
                    <Popconfirm title="确定要删除该地址吗？" onConfirm={() => handleDeleteAddress(item.id)}>
                      <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div>
                        <span>{item.name}</span>
                        <span style={{ marginLeft: 16, color: '#666' }}>{item.phone}</span>
                        {item.is_default === 1 && <Tag color="blue" style={{ marginLeft: 16 }}>默认</Tag>}
                      </div>
                    }
                    description={
                      <div>
                        {item.province}{item.city}{item.district}{item.detail}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              暂无收货地址
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card title="个人中心">
        <Tabs defaultActiveKey="info" items={items} />
      </Card>

      <Modal
        title={editingAddress ? '编辑地址' : '添加地址'}
        open={addressModalVisible}
        onOk={() => addressForm.submit()}
        onCancel={() => setAddressModalVisible(false)}
        confirmLoading={loading}
      >
        <Form
          form={addressForm}
          layout="vertical"
          onFinish={handleSaveAddress}
        >
          <Form.Item
            label="收货人"
            name="name"
            rules={[{ required: true, message: '请输入收货人' }]}
          >
            <Input placeholder="请输入收货人" />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="phone"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="省份" name="province">
            <Input placeholder="请输入省份" />
          </Form.Item>
          <Form.Item label="城市" name="city">
            <Input placeholder="请输入城市" />
          </Form.Item>
          <Form.Item label="区县" name="district">
            <Input placeholder="请输入区县" />
          </Form.Item>
          <Form.Item
            label="详细地址"
            name="detail"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input.TextArea placeholder="请输入详细地址" rows={2} />
          </Form.Item>
          <Form.Item label="设为默认" name="is_default" valuePropName="checked">
            <input type="checkbox" />
            <span style={{ marginLeft: 8 }}>设为默认地址</span>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
