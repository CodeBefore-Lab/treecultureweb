import { Marker, Popup, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Select, Drawer, Button, Layout, Card, Avatar, Pagination } from "antd";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { sendRequest } from "../utils/requests";
import { RiAddBoxFill, RiListOrdered } from "react-icons/ri";
import Meta from "antd/es/card/Meta";
import { FaTree, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "antd";

const { Content } = Layout;

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

  const blueIcon = new LeafIcon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/489/489969.png",
  });

  useEffect(() => {
    fetchData();
    getTrees();
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
    return "https://via.placeholder.com/100";
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
          const popupContent = `
            <div class="flex flex-col items-center text-center">
              <img src="${getFirstImageOrPlaceholder(tree.photoUrl)}" alt="${tree.treeName}" class="w-24 h-24 object-cover mb-3">
              <div>
                <h3 class="text-lg font-semibold">${tree.treeName}</h3>
                <div class="flex items-center justify-center mt-2">
                  <span class="text-red-500 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                  </span>
                  <span class="text-sm text-gray-600">${tree.latitude.toFixed(6)}, ${tree.longitude.toFixed(6)}</span>
                </div>
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
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  return (
    <Layout>
      <Content className="min-h-[280px]">
        <Drawer placement={"right"} closable={false} onClose={onClose} open={open} key={"right"}>
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
        <div className="bg-white p-2 w-full fixed z-10">
          <div className="flex justify-between">
            <div className="flex items-center">
              <div className="bg-green-400/70 w-24 text-white font-bold py-2 rounded-lg flex flex-row justify-around">
                <RiAddBoxFill style={{ fontSize: "24px" }} className="hover:text-green-500" onClick={() => switchTab("1")} />
                <RiListOrdered style={{ fontSize: "24px" }} onClick={() => switchTab("2")} />
              </div>
            </div>
            <div className="bg-green-300 w-24 text-white font-bold py-2 rounded-lg flex flex-row justify-around" onClick={showDrawer}>
              <RiListOrdered style={{ fontSize: "24px" }} />
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
          </MapContainer>
        ) : (
          <div className="mt-12 px-4 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {paginatedTrees.map((tree) => (
                <div
                  key={tree.treeId}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/Trees/${tree.treeId}`)}
                >
                  <div className="h-48 overflow-hidden">
                    <img src={getFirstImageOrPlaceholder(tree.photoUrl)} alt={tree.treeName} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 flex flex-col h-48">
                    <div className="flex items-center mb-2">
                      <Avatar icon={<FaTree />} className="mr-2" />
                      <h3 className="text-lg font-semibold truncate">{tree.treeName}</h3>
                    </div>
                    <div className="h-16 overflow-hidden mb-2">
                      {tree.descs ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: truncateText(tree.descs, 100),
                          }}
                          className="text-sm text-gray-600"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">No description available</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {tree.treeChoices.slice(0, 3).map((choice) => (
                        <span key={choice.choiceId} className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          {choice.choiceName}
                        </span>
                      ))}
                      {tree.treeChoices.length > 3 && (
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">+{tree.treeChoices.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Pagination
                current={currentPage}
                total={trees.data ? trees.data.length : 0}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default Maps;
