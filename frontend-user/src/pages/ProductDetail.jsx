import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  InputNumber, 
  Tag, 
  Descriptions,
  Image,
  List,
  Avatar,
  Divider,
  Select,
  Modal,
  Form,
  message
} from 'antd';
import { 
  ShoppingCartOutlined, 
  HeartOutlined,
  StarOutlined,
  StarFilled,
  UserOutlined
} from '@ant-design/icons';
import { productApi, reviewApi, addressApi, orderApi, userApi } from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProduct();
    loadReviews();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await productApi.getDetail(id);
      setProduct(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await reviewApi.getList({ product_id: id, page: 1, page_size: 10 });
      setReviews(res.data?.list || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    try {
      await productApi.addFavorite({ product_id: parseInt(id) });
      message.success('收藏成功');
    } catch (error) {
      console.error(error);
    }
  };

  const handleBuy = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    try {
      const res = await addressApi.getList();
      setAddresses(res.data || []);
      if (res.data?.length === 0) {
        message.warning('请先添加收货地址');
        navigate('/profile');
        return;
      }
      const defaultAddr = res.data.find(a => a.is_default === 1) || res.data[0];
      setSelectedAddress(defaultAddr);
      setAddressModalVisible(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddress) {
      message.warning('请选择收货地址');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const totalPrice = product.price * quantity;
    if (user.balance < totalPrice) {
      message.warning('余额不足，请先充值');
      navigate('/recharge');
      return;
    }

    try {
      const res = await orderApi.create({
        address_id: selectedAddress.id,
        items: [
          {
            product_id: product.id,
            quantity: quantity,
          }
        ]
      });
      message.success('下单成功');
      setAddressModalVisible(false);
      
      const userRes = await userApi.getInfo();
      localStorage.setItem('user', JSON.stringify(userRes.data));
      
      navigate('/orders');
    } catch (error) {
      console.error(error);
    }
  };

  const renderStars = (rating) => {
    return (
      <div>
        {[1, 2, 3, 4, 5].map(i => (
          i <= rating ? 
            <StarFilled key={i} style={{ color: '#faad14' }} /> :
            <StarOutlined key={i} style={{ color: '#faad14' }} />
        ))}
      </div>
    );
  };

  if (!product) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <Card loading={loading}>
        <Row gutter={24}>
          <Col span={10}>
            <div style={{ 
              height: 400, 
              background: '#f5f5f5', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: 8
            }}>
              {product.image ? (
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }} 
                />
              ) : (
                <ShoppingCartOutlined style={{ fontSize: 80, color: '#ccc' }} />
              )}
            </div>
          </Col>
          <Col span={14}>
            <h1 style={{ marginBottom: 16 }}>{product.name}</h1>
            
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 28, color: '#ff4d4f', fontWeight: 'bold' }}>
                ¥{product.price?.toFixed(2)}
              </span>
            </div>

            <Descriptions column={2} size="small">
              <Descriptions.Item label="库存">
                {product.stock > 0 ? (
                  <Tag color="green">库存充足 ({product.stock})</Tag>
                ) : (
                  <Tag color="red">缺货</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="销量">
                {product.sales} 件
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {product.status === 1 ? (
                  <Tag color="green">在售</Tag>
                ) : (
                  <Tag color="red">下架</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            {product.description && (
              <div style={{ marginTop: 16, padding: 16, background: '#fafafa', borderRadius: 8 }}>
                <h4 style={{ marginBottom: 8 }}>商品描述</h4>
                <p style={{ color: '#666', whiteSpace: 'pre-wrap' }}>{product.description}</p>
              </div>
            )}

            <Divider />

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span>购买数量：</span>
              <InputNumber
                min={1}
                max={product.stock}
                value={quantity}
                onChange={setQuantity}
                size="large"
              />
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <Button 
                type="primary" 
                size="large" 
                icon={<ShoppingCartOutlined />}
                onClick={handleBuy}
                disabled={product.stock === 0 || product.status !== 1}
              >
                立即购买
              </Button>
              <Button 
                size="large" 
                icon={<HeartOutlined />}
                onClick={handleAddFavorite}
              >
                加入收藏
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="商品评价" style={{ marginTop: 24 }}>
        {reviews.length > 0 ? (
          <List
            dataSource={reviews}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{item.user?.username || '用户'}</span>
                      {renderStars(item.rating)}
                    </div>
                  }
                  description={
                    <div>
                      <p style={{ color: '#333' }}>{item.content}</p>
                      <span style={{ color: '#999', fontSize: 12 }}>
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>
            暂无评价
          </div>
        )}
      </Card>

      <Modal
        title="确认订单"
        open={addressModalVisible}
        onOk={handleConfirmOrder}
        onCancel={() => setAddressModalVisible(false)}
        width={600}
      >
        <Form form={form}>
          <Form.Item label="选择收货地址">
            <Select
              placeholder="请选择收货地址"
              style={{ width: '100%' }}
              value={selectedAddress?.id}
              onChange={(value) => {
                const addr = addresses.find(a => a.id === value);
                setSelectedAddress(addr);
              }}
            >
              {addresses.map(addr => (
                <Select.Option key={addr.id} value={addr.id}>
                  {addr.name} {addr.phone} - {addr.province}{addr.city}{addr.district}{addr.detail}
                  {addr.is_default === 1 && <Tag color="blue" style={{ marginLeft: 8 }}>默认</Tag>}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Divider />

          <Card size="small" title="订单商品">
            <Row align="middle" gutter={16}>
              <Col span={6}>
                <div style={{ 
                  height: 60, 
                  background: '#f5f5f5', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} style={{ maxHeight: 60 }} />
                  ) : (
                    <ShoppingCartOutlined style={{ fontSize: 24, color: '#ccc' }} />
                  )}
                </div>
              </Col>
              <Col span={12}>
                <div>{product.name}</div>
                <div style={{ color: '#999' }}>数量: {quantity}</div>
              </Col>
              <Col span={6} style={{ textAlign: 'right' }}>
                <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                  ¥{(product.price * quantity).toFixed(2)}
                </div>
              </Col>
            </Row>
          </Card>

          <Divider />

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 16 }}>订单总额：</span>
            <span style={{ fontSize: 24, color: '#ff4d4f', fontWeight: 'bold' }}>
              ¥{(product.price * quantity).toFixed(2)}
            </span>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductDetail;
