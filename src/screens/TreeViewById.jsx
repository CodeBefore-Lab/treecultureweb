import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { sendRequest } from "../utils/requests";
import { Avatar, Button, Card } from "antd";
import Meta from "antd/es/card/Meta";
import { FaTree } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

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

const TreeDetailId = () => {
  const [datas, setDatas] = useState();
  const [mainImage, setMainImage] = useState("");
  const [additionalImages, setAdditionalImages] = useState([]);
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);

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
    // Konum bilgisini ayarla
    if (data?.data[0]?.latitude && data?.data[0]?.longitude) {
      setLocation([parseFloat(data.data[0].latitude), parseFloat(data.data[0].longitude)]);
    }
  };

  useEffect(() => {
    getTree();
  }, []);

  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.setView(location, 16);
    }
  }, [location]);

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
            className="flex flex-col justify-center items-center w-full"
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

            {location && (
              <div className="mt-4 w-full h-48">
                <MapContainer center={location} zoom={18} style={{ height: "100%", width: "100%" }} ref={mapRef}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={location}>
                    <Popup>{datas?.data[0].treeName}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}

            <Meta
              className="flex flex-col gap-2 mt-4"
              title={<h1 className=" my-5">{formatScientificName(datas?.data[0].treeName)}</h1>}
              description={
                <div className="flex flex-col gap-2">
                  <div className="text-sm" dangerouslySetInnerHTML={{ __html: datas?.data[0].descs }} />
                </div>
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
