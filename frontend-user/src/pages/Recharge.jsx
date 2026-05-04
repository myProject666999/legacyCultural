import React, { useState, useEffect } from 'react';
import { Card, Form, InputNumber, Button, message, Descriptions, Tag } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { userApi } from '../services/api';

const Recharge = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [form] = Form.useForm();

  const rechargeOptions = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const res = await userApi.getInfo();
      setUser(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRecharge = async (values) => {
    if (!values.amount || values.amount <= 0) {
      message.warning('请输入充值金额');
      return;
    }
    setLoading(true);
    try {
      const res = await userApi.recharge({ amount: values.amount });
      message.success('充值成功');
      localStorage.setItem('user', JSON.stringify({ ...user, balance: res.data.balance }));
      loadUserInfo();
      form.resetFields();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRecharge = (amount) => {
    form.setFieldsValue({ amount });
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card title="余额充值">
        <Descriptions column={1} bordered style={{ marginBottom: 24 }}>
          <Descriptions.Item label="当前账户">
            <span style={{ fontSize: 16, fontWeight: 'bold' }}>{user?.username}</span>
          </Descriptions.Item>
          <Descriptions.Item label="当前余额">
            <Tag color="blue" style={{ fontSize: 20, padding: '8px 16px' }}>
              <WalletOutlined style={{ marginRight: 8 }} />
              ¥{user?.balance?.toFixed(2) || '0.00'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleRecharge}
        >
          <Form.Item label="充值金额">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {rechargeOptions.map((amount) => (
                <Button
                  key={amount}
                  onClick={() => handleQuickRecharge(amount)}
                  style={{ minWidth: 80 }}
                >
                  ¥{amount}
                </Button>
              ))}
            </div>
          </Form.Item>

          <Form.Item
            label="自定义金额"
            name="amount"
            rules={[{ required: true, message: '请输入充值金额' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              max={100000}
              placeholder="请输入充值金额"
              prefix="¥"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              block
            >
              立即充值
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 24, padding: 16, background: '#fafafa', borderRadius: 8 }}>
          <h4 style={{ marginBottom: 8 }}>充值说明</h4>
          <ul style={{ color: '#666', fontSize: 14, margin: 0, paddingLeft: 16 }}>
            <li>充值金额将直接到账您的账户余额</li>
            <li>余额可用于购买商品</li>
            <li>单次充值最低1元，最高100000元</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Recharge;
