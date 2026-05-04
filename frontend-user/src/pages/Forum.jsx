import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Input,
  Modal,
  Form,
  message,
  Avatar,
  Empty,
  Tag,
  Descriptions,
  Divider,
  Pagination
} from 'antd';
import {
  MessageOutlined,
  EyeOutlined,
  LikeOutlined,
  PlusOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { forumApi } from '../services/api';

const { TextArea } = Input;

const Forum = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [forums, setForums] = useState([]);
  const [currentForum, setCurrentForum] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [createForm] = Form.useForm();
  const [replyForm] = Form.useForm();

  useEffect(() => {
    if (id) {
      loadForumDetail(id);
    } else {
      loadForums();
    }
  }, [id, pagination.current]);

  const loadForums = async () => {
    setLoading(true);
    try {
      const res = await forumApi.getList({
        page: pagination.current,
        page_size: pagination.pageSize,
      });
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

  const loadForumDetail = async (forumId) => {
    setLoading(true);
    try {
      const res = await forumApi.getDetail(forumId);
      setCurrentForum(res.data?.forum);
      setReplies(res.data?.replies || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForum = async (values) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await forumApi.create(values);
      message.success('发布成功');
      setCreateModalVisible(false);
      createForm.resetFields();
      loadForums();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReply = async (values) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await forumApi.createReply(id, values);
      message.success('回复成功');
      setReplyModalVisible(false);
      replyForm.resetFields();
      loadForumDetail(id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (id && currentForum) {
    return (
      <div>
        <Button onClick={() => navigate('/forum')} style={{ marginBottom: 16 }}>
          返回列表
        </Button>

        <Card loading={loading}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Avatar size={48} icon={<UserOutlined />} src={currentForum.user?.avatar} />
              <div>
                <div style={{ fontWeight: 'bold' }}>{currentForum.user?.username || '用户'}</div>
                <div style={{ color: '#999', fontSize: 12 }}>
                  {new Date(currentForum.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <h2 style={{ marginBottom: 12 }}>{currentForum.title}</h2>
            <p style={{ whiteSpace: 'pre-wrap', color: '#333', lineHeight: 1.8 }}>
              {currentForum.content}
            </p>

            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <Tag icon={<EyeOutlined />}>浏览 {currentForum.views}</Tag>
              <Tag icon={<LikeOutlined />}>点赞 {currentForum.likes}</Tag>
              <Tag icon={<MessageOutlined />}>回复 {replies.length}</Tag>
            </div>
          </div>

          <Divider />

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>全部回复 ({replies.length})</h3>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setReplyModalVisible(true)}>
                发表回复
              </Button>
            </div>

            {replies.length > 0 ? (
              <List
                dataSource={replies}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} src={item.user?.avatar} />}
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 'bold' }}>
                            {item.user?.username || '用户'}
                          </span>
                          <span style={{ color: '#999', fontSize: 12 }}>
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                      }
                      description={
                        <div>
                          <p style={{ marginBottom: 8 }}>{item.content}</p>
                          <Tag icon={<LikeOutlined />}>{item.likes}</Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无回复" />
            )}
          </div>
        </Card>

        <Modal
          title="发表回复"
          open={replyModalVisible}
          onOk={() => replyForm.submit()}
          onCancel={() => setReplyModalVisible(false)}
          confirmLoading={loading}
          width={600}
        >
          <Form
            form={replyForm}
            layout="vertical"
            onFinish={handleCreateReply}
          >
            <Form.Item
              label="回复内容"
              name="content"
              rules={[{ required: true, message: '请输入回复内容' }]}
            >
              <TextArea rows={6} placeholder="请输入回复内容" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <Card title="交流论坛" extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          发表帖子
        </Button>
      }>
        {forums.length > 0 ? (
          <div>
            <List
              dataSource={forums}
              loading={loading}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link" onClick={() => navigate(`/forum/${item.id}`)}>
                      查看详情
                    </Button>
                  ]}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/forum/${item.id}`)}
                >
                  <List.Item.Meta
                    avatar={<Avatar size={48} icon={<UserOutlined />} src={item.user?.avatar} />}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', fontSize: 16 }}>{item.title}</span>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <Tag icon={<EyeOutlined />}>{item.views}</Tag>
                          <Tag icon={<LikeOutlined />}>{item.likes}</Tag>
                          <span style={{ color: '#999', fontSize: 12 }}>
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    }
                    description={
                      <div>
                        <p style={{ color: '#666', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.content}
                        </p>
                        <span style={{ color: '#999', fontSize: 12 }}>
                          作者: {item.user?.username || '用户'}
                        </span>
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
          <Empty description="暂无帖子">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
              发表第一个帖子
            </Button>
          </Empty>
        )}
      </Card>

      <Modal
        title="发表帖子"
        open={createModalVisible}
        onOk={() => createForm.submit()}
        onCancel={() => setCreateModalVisible(false)}
        confirmLoading={loading}
        width={700}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateForum}
        >
          <Form.Item
            label="帖子标题"
            name="title"
            rules={[{ required: true, message: '请输入帖子标题' }]}
          >
            <Input placeholder="请输入帖子标题" />
          </Form.Item>
          <Form.Item
            label="帖子内容"
            name="content"
            rules={[{ required: true, message: '请输入帖子内容' }]}
          >
            <TextArea rows={8} placeholder="请输入帖子内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Forum;
