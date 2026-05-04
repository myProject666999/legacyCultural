import React, { useState, useEffect } from 'react';
import { Card, List, Button, Empty, message, Popconfirm, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ShoppingOutlined, DeleteOutlined, HeartOutlined } from '@ant-design/icons';
import { favoriteApi } from '../services/api';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    loadFavorites();
  }, [pagination.current]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteApi.getList({
        page: pagination.current,
        page_size: pagination.pageSize,
      });
      setFavorites(res.data?.list || []);
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

  const handleRemoveFavorite = async (id) => {
    try {
      await favoriteApi.remove(id);
      message.success('已取消收藏');
      loadFavorites();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Card title="我的收藏">
        {favorites.length > 0 ? (
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={favorites}
            loading={loading}
            pagination={{
              ...pagination,
              showTotal: (total) => `共 ${total} 件商品`,
              onChange: (page, pageSize) => {
                setPagination(prev => ({ ...prev, current: page, pageSize }));
              },
            }}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  cover={
                    <div 
                      style={{ 
                        height: 150, 
                        background: '#f5f5f5', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/products/${item.product_id}`)}
                    >
                      {item.product?.image ? (
                        <Image 
                          src={item.product.image} 
                          style={{ maxHeight: 150, objectFit: 'contain' }} 
                          preview={false} 
                        />
                      ) : (
                        <HeartOutlined style={{ fontSize: 48, color: '#ccc' }} />
                      )}
                    </div>
                  }
                  actions={[
                    <ShoppingOutlined 
                      key="buy" 
                      onClick={() => navigate(`/products/${item.product_id}`)}
                    />,
                    <Popconfirm 
                      title="确定要取消收藏吗？" 
                      onConfirm={() => handleRemoveFavorite(item.id)}
                    >
                      <DeleteOutlined key="delete" style={{ color: '#ff4d4f' }} />
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <div 
                        onClick={() => navigate(`/products/${item.product_id}`)} 
                        style={{ cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {item.product?.name}
                      </div>
                    }
                    description={
                      <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                        ¥{item.product?.price?.toFixed(2)}
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无收藏商品">
            <Button type="primary" onClick={() => navigate('/products')}>去逛逛</Button>
          </Empty>
        )}
      </Card>
    </div>
  );
};

export default Favorites;
