import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Pagination, Button, message, Empty } from 'antd';
import { SearchOutlined, ShoppingOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productApi, productTypeApi } from '../services/api';

const { Meta } = Card;
const { Search } = Input;

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });
  const [filters, setFilters] = useState({
    keyword: '',
    type_id: '',
  });

  useEffect(() => {
    loadTypes();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters, pagination.current]);

  const loadTypes = async () => {
    try {
      const res = await productTypeApi.getTypes();
      setTypes(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...filters,
      };
      if (!params.type_id) delete params.type_id;
      if (!params.keyword) delete params.keyword;

      const res = await productApi.getList(params);
      setProducts(res.data?.list || []);
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

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, keyword: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTypeChange = (value) => {
    setFilters(prev => ({ ...prev, type_id: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleAddFavorite = async (productId, e) => {
    e.stopPropagation();
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
      <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
        <Search
          placeholder="搜索商品"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          style={{ width: 300 }}
          onSearch={handleSearch}
        />
        <Select
          placeholder="选择分类"
          allowClear
          size="large"
          style={{ width: 200 }}
          onChange={handleTypeChange}
        >
          {types.map(type => (
            <Select.Option key={type.id} value={type.id}>{type.name}</Select.Option>
          ))}
        </Select>
        <Button 
          type="primary" 
          onClick={() => {
            setFilters({ keyword: '', type_id: '' });
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
        >
          重置
        </Button>
      </div>

      {products.length > 0 ? (
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
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${product.id}`);
                    }}
                  />,
                  <HeartOutlined 
                    key="favorite" 
                    onClick={(e) => handleAddFavorite(product.id, e)}
                  />,
                ]}
              >
                <Meta
                  title={
                    <div 
                      onClick={() => navigate(`/products/${product.id}`)} 
                      style={{ cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {product.name}
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ color: '#ff4d4f', fontSize: 18, fontWeight: 'bold' }}>
                        ¥{product.price?.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        销量: {product.sales}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="暂无商品" />
      )}

      {pagination.total > 0 && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
            onChange={(page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize }));
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Products;
