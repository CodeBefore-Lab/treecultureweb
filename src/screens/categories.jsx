import React, { useEffect, useState } from "react";
import { Layout, Typography, Card, Button, Input, Image } from "antd";
import { FaListAlt } from "react-icons/fa";
import Meta from "antd/es/card/Meta";
import { sendRequest } from "../utils/requests";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Search } = Input;
const { Text } = Typography;

const Categories = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [displayedCategories, setDisplayedCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 100;
  const navigate = useNavigate();
  const [filteredCount, setFilteredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const getCategories = async () => {
    const data = await sendRequest("GET", "TreeCategories", null);
    setAllCategories(data.data);
    setDisplayedCategories(data.data.slice(0, itemsPerPage));
    setTotalCount(data.data.length);
    setFilteredCount(data.data.length);
    console.log(data);
  };

  useEffect(() => {
    getCategories();
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const filteredCategories = allCategories.filter((category) => category.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const newCategories = filteredCategories.slice(0, endIndex);
    setDisplayedCategories(newCategories);
    setPage(nextPage);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filteredCategories = allCategories.filter((category) => category.name.toLowerCase().includes(value.toLowerCase()));
    setDisplayedCategories(filteredCategories.slice(0, itemsPerPage));
    setFilteredCount(filteredCategories.length);
    setPage(1);
  };

  // Helper function to get image URL or placeholder
  const getImageUrl = (imageUrl) => {
    return imageUrl || "https://via.placeholder.com/300";
  };

  return (
    <Layout className="bg-white h-full">
      <Content>
        <div className="p-4 flex items-center">
          <Search
            placeholder="Search categories by name"
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            value={searchTerm}
            style={{ width: 300 }}
          />
          <Text className="ml-4">
            {filteredCount} result{filteredCount !== 1 ? "s" : ""} found
          </Text>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center p-2 gap-5">
          {displayedCategories.map((category) => {
            return (
              <Card
                key={category.id}
                style={{ width: "100%", cursor: "pointer" }}
                cover={<Image alt={category.name} src={getImageUrl(category.image)} style={{ height: 200, objectFit: "cover" }} preview={false} />}
                onClick={() => navigate(`/updateCategory/${category.id}`)}
              >
                <Meta title={category.name} />
              </Card>
            );
          })}
        </div>
        {displayedCategories.length < filteredCount && (
          <div className="flex justify-center mt-4 mb-8">
            <Button onClick={loadMore} type="primary" className="bg-green-500 text-white">
              Load More ({displayedCategories.length} / {filteredCount})
            </Button>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default Categories;
