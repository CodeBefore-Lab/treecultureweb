import React, { useState, useEffect } from "react";
import { Layout, Select, Input, Button, notification, theme, List } from "antd";
import { sendRequest } from "../utils/requests";
import { Navigate, useNavigate } from "react-router-dom";
import ThemeContext from "../context";

const { Content } = Layout;
const { Option } = Select;

function AddChoice() {
  const [mainTitles, setMainTitles] = useState([]);
  const [selectedMainTitle, setSelectedMainTitle] = useState(null);
  const [groupTitles, setGroupTitles] = useState([]);
  const [selectedGroupTitle, setSelectedGroupTitle] = useState(null);
  const [choiceName, setChoiceName] = useState("");
  const [choices, setChoices] = useState([]);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    fetchChoices();
  }, []);

  const fetchChoices = async () => {
    const response = await sendRequest("GET", "Choices", null);
    if (response.success) {
      setMainTitles(response.data);
    } else {
      notification.error({
        message: "Veri yüklenemedi",
        description: "Seçenekler yüklenirken bir hata oluştu.",
      });
    }
  };

  const handleMainTitleChange = (value) => {
    setSelectedMainTitle(value);
    const selectedMain = mainTitles.find((title) => title.mainTitleId === value);
    setGroupTitles(selectedMain ? selectedMain.groupTitles : []);
    setSelectedGroupTitle(null);
    setChoices([]);
  };

  const handleGroupTitleChange = (value) => {
    setSelectedGroupTitle(value);
    const selectedMain = mainTitles.find((title) => title.mainTitleId === selectedMainTitle);
    const selectedGroup = selectedMain.groupTitles.find((group) => group.groupTitleId === value);
    setChoices(selectedGroup ? selectedGroup.choices : []);
  };

  const handleChoiceNameChange = (e) => {
    setChoiceName(e.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedGroupTitle || !choiceName.trim()) {
      notification.warning({
        message: "Eksik bilgi",
        description: "Lütfen tüm alanları doldurun.",
      });
      return;
    }

    const response = await sendRequest("POST", "Choices/AddChoice", {
      choiceName: choiceName,
      groupTitleId: selectedGroupTitle,
    });

    if (response.success) {
      notification.success({
        message: "Seçenek eklendi",
        description: "Yeni seçenek başarıyla eklendi.",
      });

      // Update the local state with the new choice
      setChoices((prevChoices) => [...prevChoices, { choiceName: choiceName, choiceId: response.data.choiceId }]);

      // Clear the input field
      setChoiceName("");

      // Refresh the entire choices list
      fetchChoices();
    } else {
      notification.error({
        message: "Hata",
        description: "Seçenek eklenirken bir hata oluştu.",
      });
    }
  };

  const token = localStorage.getItem("token");
  if (token === null) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout>
      <Content
        style={{
          margin: "24px 16px",
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl font-bold">Seçenek Ekle</h1>
          <Select placeholder="Ana Başlık Seçin" style={{ width: "100%" }} onChange={handleMainTitleChange}>
            {mainTitles.map((title) => (
              <Option key={title.mainTitleId} value={title.mainTitleId}>
                {title.mainTitleName}
              </Option>
            ))}
          </Select>
          <Select placeholder="Grup Başlığı Seçin" style={{ width: "100%" }} onChange={handleGroupTitleChange} disabled={!selectedMainTitle}>
            {groupTitles.map((group) => (
              <Option key={group.groupTitleId} value={group.groupTitleId}>
                {group.groupTitleName}
              </Option>
            ))}
          </Select>
          <Input placeholder="Seçenek Adı" value={choiceName} onChange={handleChoiceNameChange} />
          <Button onClick={handleSubmit}>Seçenek Ekle</Button>

          {selectedGroupTitle && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Mevcut Seçenekler</h2>
              <List bordered dataSource={choices} renderItem={(item) => <List.Item>{item.choiceName}</List.Item>} />
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
}

export default AddChoice;
