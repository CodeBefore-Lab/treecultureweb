import { Card, Typography, Avatar, Space, Divider } from "antd";
import { UserOutlined, EnvironmentOutlined, MailOutlined, LinkedinOutlined } from "@ant-design/icons";
import React from "react";

const { Text, Title } = Typography;

const SupportContactPage = () => {
  const userContact = {
    name: "Gamze Altun",
    title: "Araştırma Görevlisi",
    address: "Bursa Uludağ Üniversitesi\nZiraat Fakültesi Peyzaj Mimarlığı Bölümü\nTürkiye/Bursa",
    email: "gamzealtun@uludag.edu.tr",
    linkedin: "https://www.linkedin.com/in/gamze-altun-4b6783316/",
  };

  return (
    <div className="flex justify-center items-center h-screen w-full bg-gray-100">
      <Card hoverable style={{ width: 350, textAlign: "center", borderRadius: 12, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={1} style={{ margin: 0 }}>
            {userContact.name}
          </Title>
          <Text type="secondary">{userContact.title}</Text>

          <Space>
            <EnvironmentOutlined style={{ fontSize: 18, color: "#1890ff" }} />
            <Text style={{ whiteSpace: "pre-line", textAlign: "left" }}>{userContact.address}</Text>
          </Space>
          <Space>
            <MailOutlined style={{ fontSize: 18, color: "#1890ff" }} />
            <Text>{userContact.email}</Text>
          </Space>
          <Space>
            <LinkedinOutlined style={{ fontSize: 18, color: "#1890ff" }} />
            <a href={userContact.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn Profili
            </a>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default SupportContactPage;
