import React, { useContext } from "react";
import { Layout, Menu } from "antd";
import { RiAddBoxFill, RiAnchorFill, RiHome2Fill, RiInputMethodFill, RiLogoutBoxLine, RiSettings2Fill, RiUser2Fill } from "react-icons/ri";
import { FaTree } from "react-icons/fa";
import { Badge, Avatar, Dropdown, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import ThemeContext from "../context";
const { Header } = Layout;

const Navbar = () => {
  const datas = useContext(ThemeContext);
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Header className="flex items-center ">
      <FaTree size={40} color="lightgreen" />
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[]}
        items={[
          {
            key: "2",
            icon: <RiAddBoxFill />,
            label: "Ağaç Ekle",
            onClick: () => {
              navigate("/dashboard");
            },
          },
          {
            key: "3",
            icon: <RiAnchorFill />,
            label: "Görüntüleme",
            onClick: () => {
              navigate("/trees");
            },
          },
          {
            key: "4",
            icon: <RiAnchorFill />,
            label: "Kategori Ekle",
            onClick: () => {
              navigate("/category");
            },
          },
          {
            key: "5",
            icon: <RiAnchorFill />,
            label: "Kategori Görüntüle",
            onClick: () => {
              navigate("/categories");
            },
          },
        ]}
        style={{ flex: 1, minWidth: 0 }}
      />
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item
              key="1"
              icon={<RiLogoutBoxLine />}
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Çıkış Yap
            </Menu.Item>
          </Menu>
        }
      >
        <Space>
          <Avatar size="large" icon={<UserOutlined />} />
          <span>{datas.data?.email}</span>
        </Space>
      </Dropdown>
    </Header>
  );
};

export default Navbar;
