import React, { useEffect, useState } from "react";
import { Layout, Avatar, Typography, Menu, Row, Col, Card } from "antd";
import { UserOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { FaTree } from "react-icons/fa6";

import Meta from "antd/es/card/Meta";
import { sendRequest } from "../utils/requests";
import { useNavigate } from "react-router-dom";
import { RiDeleteBin5Fill } from "react-icons/ri";

const { Content } = Layout;

const Trees = () => {
  const [trees, setTrees] = useState([]);
  const navigate = useNavigate();

  const getTrees = async () => {
    const data = await sendRequest("GET", "Trees", null);

    setTrees(data);
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

  return (
    <Layout className="bg-white h-full">
      <Content>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center p-2">
          {trees.data &&
            trees.data.map((tree) => {
              return (
                <Card key={tree.treeId} style={{ width: 300 }} cover={<img alt="example" src={tree.photoUrl} />}>
                  <Meta
                    avatar={<Avatar icon={<FaTree />} />}
                    title={tree.treeName}
                    onClick={() => navigate(`/updateTree/${tree.treeId}`)}
                    description={
                      //show only 10 characters of the description
                      tree.descs.length > 10 ? tree.descs.substring(0, 10) + "..." : tree.descs
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
      </Content>
    </Layout>
  );
};

export default Trees;
