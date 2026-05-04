import React, { useState, useEffect } from 'react';
import { Carousel, Card, Row, Col, Button, Tag, message } from 'antd';
import { ShoppingOutlined, HeartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { carouselApi, productApi, announcementApi } from '../services/api';

const { Meta } = Card;

const Home = () => {
  const navigate = useNavigate();
  const [carousels, setCarousels] = useState([]);
  const [products, setProducts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [carouselRes, productRes, announcementRes] = await Promise.all([
        carouselApi.getList(),
        productApi.getList({ page: 1, page_size: 8 }),
        announcementApi.getList(),
      ]);
      setCarousels(carouselRes.data || []);
      setProducts(productRes.data?.list || []);
      setAnnouncements(announcementRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    try {
      await productApi.addFavorite({ product_id: productId });
      message.success('收藏成功');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {carousels.length > 0 && (
        <Carousel autoplay style={{ marginBottom: 24, borderRadius: 8, overflow: 'hidden' }}>
          {carousels.map((item) => (
            <div key={item.id} style={{ height: 300, background: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.title} 
                  style={{ width: '100%', height: 300, objectFit: 'cover' }} 
                />
              ) : (
                <h2 style={{ color: 'white' }}>{item.title || '非遗文创商城'}</h2>
              )}
            </div>
          ))}
        </Carousel>
      )}

      {announcements.length > 0 && (
        <div style={{ background: '#e6f7ff', padding: '12px 24px', marginBottom: 24, borderRadius: 8 }}>
          <Tag color="blue">公告</Tag>
          <span style={{ marginLeft: 8, color: '#1890ff' }}>
            {announcements[0]?.title}
          </span>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>精选商品</h2>
          <Button type="link" onClick={() => navigate('/products')}>查看更多</Button>
        </div>
        <Row gutter={[16, 16]}>
          {products.map((product) => (
            <Col xs={12} sm={8} md={6} key={product.id}>
              <Card
                hoverable
                loading={loading}
                cover={
                  <div 
                    style={{ 
                      height: 200, 
                      background: '#f5f5f5', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }} 
                      />
                    ) : (
                      <ShoppingOutlined style={{ fontSize: 48, color: '#ccc' }} />
                    )}
                  </div>
                }
                actions={[
                  <ShoppingOutlined 
                    key="buy" 
                    onClick={() => navigate(`/products/${product.id}`)}
                  />,
                  <HeartOutlined 
                    key="favorite" 
                    onClick={() => handleAddFavorite(product.id)}
                  />,
                ]}
              >
                <Meta
                  title={
                    <div onClick={() => navigate(`/products/${product.id}`)} style={{ cursor: 'pointer' }}>
                      {product.name}
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ color: '#ff4d4f', fontSize: 18, fontWeight: 'bold' }}>
                        ¥{product.price?.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        销量: {product.sales} | 库存: {product.stock}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {announcements.length > 0 && (
        <div style={{ background: '#fafafa', padding: 24, borderRadius: 8 }}>
          <h3 style={{ marginBottom: 16 }}>最新公告</h3>
          {announcements.map((item) => (
            <div 
              key={item.id} 
              style={{ 
                padding: '12px 0', 
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <EyeOutlined style={{ color: '#1890ff' }} />
                <span>{item.title}</span>
              </div>
              <span style={{ color: '#999', fontSize: 12 }}>
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
