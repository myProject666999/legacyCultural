import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Image,
  Empty,
  Tag,
  Descriptions,
  Pagination
} from 'antd';
import {
  EyeOutlined,
  CalendarOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { newsApi } from '../services/api';

const News = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [newsList, setNewsList] = useState([]);
  const [currentNews, setCurrentNews] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    if (id) {
      loadNewsDetail(id);
    } else {
      loadNews();
    }
  }, [id, pagination.current]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const res = await newsApi.getList({
        page: pagination.current,
        page_size: pagination.pageSize,
      });
      setNewsList(res.data?.list || []);
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

  const loadNewsDetail = async (newsId) => {
    setLoading(true);
    try {
      const res = await newsApi.getDetail(newsId);
      setCurrentNews(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (id && currentNews) {
    return (
      <div>
        <Button 
          onClick={() => navigate('/news')} 
          style={{ marginBottom: 16 }}
          icon={<ArrowLeftOutlined />}
        >
          返回列表
        </Button>

        <Card loading={loading}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ marginBottom: 16 }}>{currentNews.title}</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, color: '#999' }}>
              <Tag icon={<CalendarOutlined />}>
                {new Date(currentNews.created_at).toLocaleString()}
              </Tag>
              <Tag icon={<EyeOutlined />}>
                浏览 {currentNews.views}
              </Tag>
            </div>
          </div>

          {currentNews.cover && (
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Image 
                src={currentNews.cover} 
                style={{ maxHeight: 400, borderRadius: 8 }} 
              />
            </div>
          )}

          <div style={{ lineHeight: 2, fontSize: 16, color: '#333', whiteSpace: 'pre-wrap' }}>
            {currentNews.content}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Card title="新闻资讯">
        {newsList.length > 0 ? (
          <div>
            <List
              dataSource={newsList}
              loading={loading}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/news/${item.id}`)}
                >
                  <List.Item.Meta
                    avatar={
                      item.cover ? (
                        <div style={{ width: 120, height: 80, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}>
                          <Image 
                            src={item.cover} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            preview={false}
                          />
                        </div>
                      ) : null
                    }
                    title={
                      <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                        {item.title}
                      </div>
                    }
                    description={
                      <div>
                        <p style={{ 
                          color: '#666', 
                          marginBottom: 8,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {item.content}
                        </p>
                        <div style={{ display: 'flex', gap: 16, color: '#999', fontSize: 12 }}>
                          <Tag icon={<CalendarOutlined />}>
                            {new Date(item.created_at).toLocaleDateString()}
                          </Tag>
                          <Tag icon={<EyeOutlined />}>
                            浏览 {item.views}
                          </Tag>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                showTotal={(total) => `共 ${total} 条`}
                onChange={(page, pageSize) => {
                  setPagination(prev => ({ ...prev, current: page, pageSize }));
                }}
              />
            </div>
          </div>
        ) : (
          <Empty description="暂无新闻资讯" />
        )}
      </Card>
    </div>
  );
};

export default News;
