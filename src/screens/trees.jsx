import React, { useEffect, useState } from "react";
import { Layout, Avatar, Typography, Menu, Row, Col, Card, Button } from "antd";
import { UserOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { FaTree } from "react-icons/fa6";

import Meta from "antd/es/card/Meta";
import { sendRequest } from "../utils/requests";
import { useNavigate } from "react-router-dom";
import { RiDeleteBin5Fill } from "react-icons/ri";

const { Content } = Layout;

const Trees = () => {
  const [allTrees, setAllTrees] = useState([]);
  const [displayedTrees, setDisplayedTrees] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();

  const getTrees = async () => {
    const data = await sendRequest("GET", "Trees", null);
    setAllTrees(data.data);
    setDisplayedTrees(data.data.slice(0, itemsPerPage));
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
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const newTrees = allTrees.slice(startIndex, endIndex);
    setDisplayedTrees((prevTrees) => [...prevTrees, ...newTrees]);
    setPage(nextPage);
  };

  // Yardımcı fonksiyon: İlk resmi veya placeholder'ı döndürür
  const getFirstImageOrPlaceholder = (photoUrl) => {
    if (photoUrl) {
      const urls = photoUrl.split(",");
      return urls[0].trim(); // İlk resmi al ve boşlukları temizle
    }
    return "https://via.placeholder.com/300"; // Placeholder resim URL'si
  };

  return (
    <Layout className="bg-white h-full">
      <Content>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center p-2">
          {displayedTrees.map((tree) => {
            return (
              <Card
                key={tree.treeId}
                style={{ width: 300 }}
                cover={<img alt={tree.treeName} src={getFirstImageOrPlaceholder(tree.photoUrl)} style={{ height: 200, objectFit: "cover" }} />}
              >
                <Meta
                  avatar={<Avatar icon={<FaTree />} />}
                  title={tree.treeName}
                  onClick={() => navigate(`/updateTree/${tree.treeId}`)}
                  description={
                    //show only 10 characters of the description
                    tree.descs && tree.descs.length > 10 ? tree.descs.substring(0, 10) + "..." : <pre>{tree.descs}</pre>
                  }
                />

                <div className="flex flex-row gap-2 my-5 ">
                  {tree.treeChoices.map((choice) => {
                    return (
                      <div
                        className="
                      
                        bg-gray-100
                        p-2
                        w-24
                        rounded-lg
                         shadow-rose-800
                        "
                        key={choice.choiceId}
                      >
                        <p>{choice.choiceName}</p>
                      </div>
                    );
                  })}
                </div>

                <div></div>
              </Card>
            );
          })}
        </div>
        {displayedTrees.length < allTrees.length && (
          <div className="flex justify-center mt-4 mb-8">
            <Button onClick={loadMore} type="primary" className="bg-green-500 text-white">
              Load More
            </Button>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default Trees;
