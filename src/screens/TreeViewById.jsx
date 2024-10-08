import React, { useEffect, useState } from "react";
import { Layout, Typography, Card, Spin, Button, Image } from "antd";
import { sendRequest } from "../utils/requests";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const { Content } = Layout;
const { Text } = Typography;
const { Meta } = Card;

// Yeni ikon tanımlaması
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Yeni fonksiyon ekleyelim
const formatScientificName = (name) => {
  const parts = name.split(" ");
  let italicPart = [];
  let normalPart = [];

  for (let i = 0; i < parts.length; i++) {
    if (i === 0 || (i === 1 && parts[i][0].toLowerCase() === parts[i][0])) {
      italicPart.push(parts[i]);
    } else {
      normalPart.push(parts[i]);
    }
  }

  return (
    <>
      <i>{italicPart.join(" ")}</i>
      {normalPart.length > 0 && " "}
      {normalPart.join(" ")}
    </>
  );
};

const TreeViewById = () => {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [additionalImages, setAdditionalImages] = useState([]);
  const [location, setLocation] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getTree = async () => {
      try {
        const response = await sendRequest("GET", `Trees/${id}`);
        if (response.success && response.data.length > 0) {
          setTree(response.data[0]);
          if (response.data[0].photoUrl) {
            const urls = response.data[0].photoUrl.split(",").map((url) => url.trim());
            setMainImage(urls[0]);
            setAdditionalImages(urls.slice(1));
          }
          if (response.data[0].latitude && response.data[0].longitude) {
            setLocation([parseFloat(response.data[0].latitude), parseFloat(response.data[0].longitude)]);
          }
        } else {
          console.error("Tree not found or empty response");
        }
      } catch (error) {
        console.error("Error fetching tree:", error);
      } finally {
        setLoading(false);
      }
    };

    getTree();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleImageClick = (newMainImage) => {
    setAdditionalImages((prevImages) => [mainImage, ...prevImages.filter((img) => img !== newMainImage)]);
    setMainImage(newMainImage);
  };

  const placeholderImage = "https://via.placeholder.com/400x200?text=No+Image";

  if (loading) {
    return (
      <Layout className="bg-white h-full flex items-center justify-center">
        <Spin size="large" />
      </Layout>
    );
  }

  if (!tree) {
    return (
      <Layout className="bg-white h-full flex items-center justify-center">
        <Text>Tree not found</Text>
      </Layout>
    );
  }

  return (
    <Layout className="bg-white h-full w-full">
      <Content className="p-4 flex flex-col items-center justify-center">
        <Button onClick={handleGoBack} className="mb-4">
          Geri Dön
        </Button>
        <Card
          className="w-full"
          style={{ maxWidth: "100%", margin: "0 auto" }}
          cover={<Image alt={tree.treeName} src={mainImage || placeholderImage} fallback={placeholderImage} style={{ height: 500, objectFit: "cover" }} />}
        >
          {additionalImages.length > 0 && (
            <div className="flex mt-2 overflow-x-auto justify-center mb-12">
              {additionalImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${tree.treeName} - ${index + 2}`}
                  className="w-20 h-20 object-cover mr-2 cursor-pointer"
                  onClick={() => handleImageClick(img)}
                />
              ))}
            </div>
          )}
          <Meta title={formatScientificName(tree.treeName)} className="text-center" />
          <div className="flex flex-col items-center mt-4 gap-2">
            <div className="text-gray-500" dangerouslySetInnerHTML={{ __html: tree.descs }} />

            {location && (
              <div className="mt-4 w-full h-96">
                <MapContainer center={location} zoom={18} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={location}>
                    <Popup>{tree.treeName}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default TreeViewById;
