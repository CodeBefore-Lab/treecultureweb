import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { sendRequest } from "../utils/requests";
import { Avatar, Button, Card } from "antd";
import Meta from "antd/es/card/Meta";
import { FaTree } from "react-icons/fa";

const TreeDetailId = () => {
  const [datas, setDatas] = useState();
  const [mainImage, setMainImage] = useState("");
  const [additionalImages, setAdditionalImages] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();

  const getTree = async () => {
    const data = await sendRequest("GET", `Trees/${id}`);
    setDatas(data);
    if (data?.data[0]?.photoUrl) {
      const urls = data.data[0].photoUrl.split(",").map((url) => url.trim());
      setMainImage(urls[0]);
      setAdditionalImages(urls.slice(1));
    }
  };

  useEffect(() => {
    getTree();
  }, []);

  const handleImageClick = (newMainImage) => {
    setAdditionalImages((prevImages) => [mainImage, ...prevImages.filter((img) => img !== newMainImage)]);
    setMainImage(newMainImage);
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md m-4 flex justify-center items-center flex-col">
      {datas && datas.data.length > 0 ? (
        <>
          <button onClick={() => navigate("/")} className="text-dark font-bold py-2 px-4 rounded border border-black my-2">
            Geri Dön
          </button>
          <Card
            key={datas?.treeId}
            className="flex flex-col justify-center items-center"
            cover={<img alt={datas?.data[0].treeName} className="w-96 h-96 object-cover" src={mainImage || "https://via.placeholder.com/300"} />}
          >
            {additionalImages.length > 0 && (
              <div className="flex mt-2 overflow-x-auto">
                {additionalImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${datas?.data[0].treeName} - ${index + 2}`}
                    className="w-20 h-20 object-cover mr-2 cursor-pointer"
                    onClick={() => handleImageClick(img)}
                  />
                ))}
              </div>
            )}
            <Meta
              className="flex flex-col gap-2 mt-4"
              avatar={<Avatar icon={<FaTree />} />}
              title={datas?.data[0].treeName}
              description={
                <>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm" dangerouslySetInnerHTML={{ __html: datas?.data[0].descs }} />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {datas?.data[0].treeChoices?.map((choice) => (
                        <div key={choice.choiceId} className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          {choice.choiceName}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              }
            />
          </Card>
        </>
      ) : (
        <>
          <h1>Ağaç Bulunamadı</h1>
          <Button onClick={() => navigate("/trees")}>Ağaçlara Geri Dön</Button>
        </>
      )}
    </div>
  );
};

export default TreeDetailId;
