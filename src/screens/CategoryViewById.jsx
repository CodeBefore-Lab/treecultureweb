import React, { useEffect, useState } from "react";
import { Layout, Typography, Card, Spin, Button, List, Image } from "antd";
import { FaFolder } from "react-icons/fa";
import Meta from "antd/es/card/Meta";
import { sendRequest } from "../utils/requests";
import { useParams, useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Text } = Typography;

const CategoryViewById = () => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getCategory = async () => {
      try {
        const response = await sendRequest("GET", `TreeCategories/${id}`, null);
        if (response.success && response.data.length > 0) {
          setCategory(response.data[0]);
        } else {
          console.error("Category not found or empty response");
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setLoading(false);
      }
    };

    getCategory();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  // Placeholder image URL
  const placeholderImage = "https://via.placeholder.com/400x200?text=No+Image";

  if (loading) {
    return (
      <Layout className="bg-white h-full flex items-center justify-center">
        <Spin size="large" />
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout className="bg-white h-full flex items-center justify-center">
        <Text>Category not found</Text>
      </Layout>
    );
  }

  return (
    <Layout className="bg-white h-full w-full">
      <Content className="p-4 flex flex-col items-center justify-center">
        <Button onClick={handleGoBack} className="mb-4 ">
          Geri Dön
        </Button>
        <Card
          className="w-full "
          style={{ maxWidth: "100%", margin: "0 auto" }}
          cover={<Image alt={category.name} src={category.image || placeholderImage} fallback={placeholderImage} style={{ height: 500, objectFit: "cover" }} />}
        >
          <Meta title={category.name} className="text-center" />
          <div className="flex items-center mt-4 gap-2 justify-center">
            <div className="text-gray-500" dangerouslySetInnerHTML={{ __html: category.description }} />
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default CategoryViewById;
