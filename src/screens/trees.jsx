import React, { useEffect, useState } from "react";
import { Layout, Avatar, Typography, Menu, Row, Col, Card, Button, Input } from "antd";
import { UserOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { FaTree } from "react-icons/fa6";
import { FaMapMarkerAlt } from "react-icons/fa";

import Meta from "antd/es/card/Meta";
import { sendRequest } from "../utils/requests";
import { useNavigate } from "react-router-dom";
import { RiDeleteBin5Fill } from "react-icons/ri";

const { Content } = Layout;
const { Search } = Input;
const { Text } = Typography;

const Trees = () => {
  const [allTrees, setAllTrees] = useState([]);
  const [displayedTrees, setDisplayedTrees] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 100;
  const navigate = useNavigate();
  const [filteredCount, setFilteredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const getTrees = async () => {
    const data = await sendRequest("GET", "Trees", null);
    setAllTrees(data.data);
    setDisplayedTrees(data.data.slice(0, itemsPerPage));
    setTotalCount(data.data.length);
    setFilteredCount(data.data.length);
    console.log(data);
  };

  const deleteTree = async (treeId) => {
    const data = await sendRequest("DELETE", `Trees/${treeId}`, null);
    console.log(data);
    getTrees();
  };

  useEffect(() => {
    getTrees();
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const filteredTrees = allTrees.filter((tree) => tree.treeName.toLowerCase().includes(searchTerm.toLowerCase()));
    const newTrees = filteredTrees.slice(0, endIndex);
    setDisplayedTrees(newTrees);
    setPage(nextPage);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filteredTrees = allTrees.filter((tree) => tree.treeName.toLowerCase().includes(value.toLowerCase()));
    setDisplayedTrees(filteredTrees.slice(0, itemsPerPage));
    setFilteredCount(filteredTrees.length);
    setPage(1);
  };

  // Yardımcı fonksiyon: İlk resmi veya placeholder'ı döndürür
  const getFirstImageOrPlaceholder = (photoUrl) => {
    if (photoUrl) {
      const urls = photoUrl.split(",");
      return urls[0].trim(); // İlk resmi al ve boşlukları temizle
    }
    return "https://via.placeholder.com/300"; // Placeholder resim URL'si
  };

  // HTML içeriğini güvenli bir şekilde render etmek için yardımcı fonksiyon
  const createMarkup = (html) => {
    return { __html: html };
  };

  return (
    <Layout className="bg-white h-full">
      <Content>
        <div className="p-4 flex items-center">
          <Search
            placeholder="Search trees by name"
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
          {displayedTrees.map((tree) => {
            return (
              <Card
                key={tree.treeId}
                style={{ width: 300, cursor: "pointer" }}
                cover={<img alt={tree.treeName} src={getFirstImageOrPlaceholder(tree.photoUrl)} style={{ height: 200, objectFit: "cover" }} />}
                onClick={() => navigate(`/updateTree/${tree.treeId}`)}
              >
                <Meta title={tree.treeName} />

                <div className="flex items-center mt-2 gap-2">
                  <FaMapMarkerAlt className="text-red-500 mr-2" />
                  <Text className="text-sm text-gray-500">
                    <span>
                      {tree.latitude}
                      <br />
                      {tree.longitude}
                    </span>
                  </Text>
                </div>

                {/* Eğer silme butonu varsa, buraya ekleyebilirsiniz */}
                {/* <Button
                  icon={<RiDeleteBin5Fill />}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTree(tree.treeId);
                  }}
                  className="mt-2"
                >
                  Delete
                </Button> */}
              </Card>
            );
          })}
        </div>
        {displayedTrees.length < filteredCount && (
          <div className="flex justify-center mt-4 mb-8">
            <Button onClick={loadMore} type="primary" className="bg-green-500 text-white">
              Load More ({displayedTrees.length} / {filteredCount})
            </Button>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default Trees;
