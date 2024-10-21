import { Marker, Popup, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Select, Drawer, Button, Layout, Card, Avatar, Pagination, Modal, Input, Typography, Image } from "antd";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { sendRequest } from "../utils/requests";
import { RiAddBoxFill, RiListOrdered } from "react-icons/ri";
import { CloseOutlined } from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import { FaTree, FaMapMarkerAlt, FaListAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "antd";
import React from "react";

const { Content } = Layout;
const { Search } = Input;
const { Text } = Typography;

const LeafIcon = L.Icon.extend({
  options: {
    iconSize: [16, 16],
    iconAnchor: [4, 8],
    popupAnchor: [0, -8],
  },
});

const Maps = () => {
  const [datas, setDatas] = useState();
  const [tab, setTab] = useState("1");
  const [open, setOpen] = useState(false);
  const [trees, setTrees] = useState([]);
  const [visibleTrees, setVisibleTrees] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 100;
  const [isAnketModalVisible, setIsAnketModalVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [displayedCategories, setDisplayedCategories] = useState([]);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const categoryItemsPerPage = 100;

  const filterTreeData = (value) => {
    if (value.length === 0) {
      getTrees();
      return;
    }
    const filtered = trees.data.filter((tree) => {
      return tree.treeChoices.some((choice) => value.includes(choice.choiceId));
    });

    setTrees({ data: filtered });
  };

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

    return `<i>${italicPart.join(" ")}</i>${normalPart.length > 0 ? " " : ""}${normalPart.join(" ")}`;
  };

  const navigate = useNavigate();
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  const fetchData = async () => {
    const data = await sendRequest("GET", "Choices", null);
    setDatas(data);
    console.log(data);
  };

  const switchTab = (tab) => {
    setTab(tab);
  };

  const getTrees = async () => {
    const data = await sendRequest("GET", "Trees", null);

    setTrees(data);
    console.log(data);
  };

  const getCategories = async () => {
    const data = await sendRequest("GET", "TreeCategories", null);

    setCategories(data.data);
    setDisplayedCategories(data.data.slice(0, categoryItemsPerPage));
  };

  const blueIcon = new LeafIcon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/489/489969.png",
  });

  useEffect(() => {
    fetchData();
    getTrees();
    getCategories();
  }, []);

  useEffect(() => {
    if (trees.data) {
      setVisibleTrees(trees.data);
    }
  }, [trees.data]);

  const getFirstImageOrPlaceholder = (photoUrl) => {
    if (photoUrl) {
      const urls = photoUrl.split(",");
      return urls[0].trim();
    }
    return "https://via.placeholder.com/300";
  };

  const MapContent = () => {
    const map = useMap();
    const canvasRef = useRef(null);
    const markersLayerRef = useRef(null);
    const updateTimeoutRef = useRef(null);

    useEffect(() => {
      if (!map) return;

      const canvas = L.canvas({ padding: 0.5 });
      canvasRef.current = canvas;

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      return () => {
        if (markersLayerRef.current) {
          markersLayerRef.current.clearLayers();
        }
      };
    }, [map]);

    const updateVisibleMarkers = useCallback(() => {
      if (!map || !trees.data || !markersLayerRef.current || !canvasRef.current) return;

      const bounds = map.getBounds();
      const zoom = map.getZoom();
      const maxMarkers = Math.pow(2, zoom) * 20;

      markersLayerRef.current.clearLayers();

      const visibleTrees = trees.data.filter((tree) => bounds.contains([tree.latitude, tree.longitude])).slice(0, maxMarkers);

      visibleTrees.forEach((tree) => {
        const marker = L.circleMarker([tree.latitude, tree.longitude], {
          radius: 6,
          fillColor: "#00FF00",
          color: "#008000",
          weight: 2,
          opacity: 2,
          fillOpacity: 0.8,
        }).addTo(markersLayerRef.current);

        marker.bindPopup(() => {
          const treeUrl = `https://peyzajbitkileri.uludag.edu.tr/Trees/${tree.treeId}`;
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(treeUrl)}`;

          const popupContent = `
            <div class="flex flex-col items-center text-center">
              <img src="${getFirstImageOrPlaceholder(tree.photoUrl)}" alt="${tree.treeName}" class="w-24 h-24 object-cover mb-3">
              <div>
                <h3 class="text-lg font-normal">${formatScientificName(tree.treeName)}</h3>
                <div class="flex items-center justify-center mt-2">
                  <span class="text-red-500 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                  </span>
                  <span class="text-sm text-gray-600">${tree.latitude.toFixed(6)}, ${tree.longitude.toFixed(6)}</span>
                </div>
                <img src="${qrCodeUrl}" alt="Tree QR Code" class="w-32 h-32 my-3 mx-auto">
                <button onclick="window.navigateToTree(${
                  tree.treeId
                })" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-2">Detay</button>
              </div>
            </div>
          `;
          return popupContent;
        });
      });
    }, [map, trees.data]);

    const debouncedUpdateVisibleMarkers = useCallback(() => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(updateVisibleMarkers, 100);
    }, [updateVisibleMarkers]);

    useMapEvents({
      moveend: debouncedUpdateVisibleMarkers,
      zoomend: debouncedUpdateVisibleMarkers,
    });

    useEffect(() => {
      updateVisibleMarkers();
      return () => {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
      };
    }, [updateVisibleMarkers]);

    return null;
  };

  useEffect(() => {
    window.navigateToTree = (treeId) => {
      navigate(`/Trees/${treeId}`);
    };
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedTrees = useMemo(() => {
    if (!trees.data) return [];
    const startIndex = (currentPage - 1) * pageSize;
    return trees.data.slice(startIndex, startIndex + pageSize);
  }, [trees.data, currentPage]);

  const truncateText = (text, maxLength) => {
    if (!text) return ""; // Return empty string if text is undefined or null
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  const showAnketModal = () => {
    setIsAnketModalVisible(true);
  };

  const handleAnketModalClose = () => {
    setIsAnketModalVisible(false);
  };

  const handleCategorySearch = (value) => {
    setCategorySearchTerm(value);
    const filteredCategories = categories.filter((category) => category.name.toLowerCase().includes(value.toLowerCase()));
    setDisplayedCategories(filteredCategories.slice(0, categoryItemsPerPage));
    setCategoryPage(1);
  };

  const handleCategoryPageChange = (page) => {
    setCategoryPage(page);
    const startIndex = (page - 1) * categoryItemsPerPage;
    const endIndex = startIndex + categoryItemsPerPage;
    setDisplayedCategories(categories.slice(startIndex, endIndex));
  };

  const getImageUrl = (imageUrl) => {
    return imageUrl || "https://via.placeholder.com/300";
  };

  const LocationMarker = () => {
    const [position, setPosition] = useState(null);
    const map = useMap();

    useEffect(() => {
      map.locate().on("locationfound", function (e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, 18);
      });
    }, [map]);

    const createCustomIcon = (position) => {
      return L.divIcon({
        className: "custom-icon",
        html: `
          <div class="pulse"></div>
          <div class="center-circle"></div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
    };

    return position === null ? null : (
      <Marker position={position} icon={createCustomIcon(position)}>
        <Popup>You are here</Popup>
      </Marker>
    );
  };

  return (
    <Layout>
      <Content className="min-h-[280px] bg-white">
        <Drawer placement={"right"} closable={false} onClose={onClose} open={open} key={"right"}>
          <div className="flex justify-end mb-4">
            <Button icon={<CloseOutlined />} onClick={onClose} type="text" className="text-gray-500 hover:text-gray-700" />
          </div>
          <Button
            className="w-full mb-5 bg-green-400 text-white"
            onClick={() => {
              console.log("filtered");
            }}
          >
            Filtrele
          </Button>

          {datas &&
            datas.data.map((data) => (
              <div key={`group-${data.groupTitleId}`} className="flex flex-col">
                <h1 className="text-xl py-3 font-bold">{data.mainTitleName}</h1>
                {data.groupTitles.map((choice) => (
                  <Select
                    key={`select-${choice.groupTitleId}`}
                    mode="multiple"
                    className="w-full mb-5"
                    placeholder={choice.groupTitleName}
                    onChange={(value) => filterTreeData(value)}
                  >
                    {choice.choices.map((item) => (
                      <Select.Option key={`option-${item.choiceId}`} value={item.choiceId}>
                        {item.choiceName}
                      </Select.Option>
                    ))}
                  </Select>
                ))}
              </div>
            ))}
        </Drawer>
        <div className="bg-blue-100 p-2 w-full fixed z-10">
          <div className="flex justify-between">
            <div className="flex items-center">
              <div className="bg-green-600/90 w-24 text-white font-bold py-2 rounded-lg flex flex-row justify-around">
                <RiAddBoxFill style={{ fontSize: "24px" }} className="hover:text-green-500" onClick={() => switchTab("1")} />
                <RiListOrdered style={{ fontSize: "24px" }} onClick={() => switchTab("2")} />
              </div>
            </div>

            <div className="flex">
              <div className="bg-blue-500 w-24 text-white font-bold py-2 rounded-lg flex flex-row justify-around" onClick={showAnketModal}>
                <span>Anket</span>
              </div>
              <div className="bg-green-600/90 w-24 text-white font-bold py-2 rounded-lg flex flex-row justify-around ml-2" onClick={showDrawer}>
                <RiListOrdered style={{ fontSize: "24px" }} />
              </div>
            </div>
          </div>
        </div>
        {tab === "1" ? (
          <MapContainer
            center={[40.228943, 28.872169]}
            zoom={15}
            scrollWheelZoom={true}
            style={{ height: "100vh", width: "100%", zIndex: 0 }}
            zoomControl={false}
            maxZoom={20}
            preferCanvas={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={20}
            />
            <MapContent />
            <LocationMarker />
          </MapContainer>
        ) : (
          <div className="mt-12 px-4 py-12 bg-blue-100 h-screen">
            <div className="mb-4">
              <Search
                placeholder="Search categories by name"
                onSearch={handleCategorySearch}
                onChange={(e) => handleCategorySearch(e.target.value)}
                value={categorySearchTerm}
                style={{ width: 300 }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displayedCategories.map((category) => (
                <Card
                  key={category.id}
                  hoverable
                  style={{ width: "100%" }}
                  onClick={() => navigate(`/categorydetail/${category.id}`)}
                  cover={<Image alt={category.name} src={getImageUrl(category.image)} style={{ height: 200, objectFit: "cover" }} preview={false} />}
                >
                  <Meta
                    avatar={<FaListAlt className="text-green-500" size={24} />}
                    title={
                      <h1 className="text-lg font-normal">
                        <span dangerouslySetInnerHTML={{ __html: formatScientificName(category.name) }} />
                      </h1>
                    }
                  />
                </Card>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Pagination
                current={categoryPage}
                total={categories.length}
                pageSize={categoryItemsPerPage}
                onChange={handleCategoryPageChange}
                showSizeChanger={false}
              />
            </div>
          </div>
        )}

        <Modal title="Anketler" visible={isAnketModalVisible} onCancel={handleAnketModalClose} footer={null}>
          <div className="flex flex-col space-y-4">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSfRsgkOtt3Cm20nrkR9lhm7HMbhRv3AIZ3iEHAz5MN7hbZvdg/viewform?embedded=true'"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white py-2 px-4 rounded text-center"
            >
              Genel değerlendirme
            </a>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSf9o-Tqkx-Vk2MoCiDWPtalJkd9IKKJKFJGic5gemF4lS46Sw/viewform?embedded=true"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white py-2 px-4 rounded text-center"
            >
              Öğrenci değerlendirmesi
            </a>
          </div>
        </Modal>
        <style jsx global>{`
          .custom-icon {
            background: transparent;
            border: none;
          }
          .center-circle {
            width: 20px;
            height: 20px;
            background-color: #007aff;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          .pulse {
            background-color: rgba(0, 122, 255, 0.2);
            border-radius: 50%;
            height: 40px;
            width: 40px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(0.5);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(1.5);
              opacity: 0;
            }
          }
        `}</style>
      </Content>
    </Layout>
  );
};

export default Maps;
