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
  Descriptions,
  List
} from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { forumApi } from '../services/api';

const { Search } = Input;

const ForumManagement = () => {
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentForum, setCurrentForum] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadForums();
  }, [pagination.current, pagination.pageSize]);

  const loadForums = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
      };
      if (searchKeyword) params.keyword = searchKeyword;

      const res = await forumApi.getList(params);
      setForums(res.data?.list || []);
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

  const handleViewDetail = async (record) => {
    try {
      const res = await forumApi.getDetail(record.id);
      setCurrentForum(res.data);
      setDetailModalVisible(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await forumApi.delete(id);
      message.success('删除成功');
      loadForums();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteReply = async (id) => {
    try {
      await forumApi.deleteReply(id);
      message.success('删除回复成功');
      if (currentForum) {
        handleViewDetail({ id: currentForum.id });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(loadForums, 100);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '作者',
      dataIndex: ['user', 'username'],
      key: 'user',
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      key: 'likes',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            <EyeOutlined /> 查看
          </Button>
          <Popconfirm
            title="确定要删除该帖子吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger>
              <DeleteOutlined /> 删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="论坛管理"
        extra={
          <Space>
            <Search
              placeholder="搜索帖子标题"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
            <Button onClick={handleSearch} type="primary">
              搜索
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={forums}
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

      <Modal
        title="帖子详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentForum && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="标题" span={2}>{currentForum.title}</Descriptions.Item>
              <Descriptions.Item label="作者">{currentForum.user?.username}</Descriptions.Item>
              <Descriptions.Item label="浏览量">{currentForum.views}</Descriptions.Item>
              <Descriptions.Item label="点赞数">{currentForum.likes}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{new Date(currentForum.created_at).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="内容" span={2}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{currentForum.content}</div>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <h4>回复列表</h4>
              <List
                dataSource={currentForum.replies || []}
                rowKey="id"
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        title="确定要删除该回复吗？"
                        onConfirm={() => handleDeleteReply(item.id)}
                      >
                        <Button type="link" size="small" danger>删除</Button>
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <span>
                          <strong>{item.user?.username}</strong>
                          <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </span>
                      }
                      description={item.content}
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ForumManagement;
