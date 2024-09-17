import { Marker, Popup, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Select, Drawer, Button, Layout, Card, Avatar } from "antd";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { sendRequest } from "../utils/requests";
import { RiAddBoxFill, RiListOrdered } from "react-icons/ri";
import Meta from "antd/es/card/Meta";
import { FaTree } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FixedSizeList as List } from "react-window";

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
  const [page, setPage] = useState(1);
  const pageSize = 20;

  //filter trees by choices id onchange select
  const filterTreeData = (value) => {
    //if value is empty, set trees to default
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
      const maxMarkers = Math.pow(2, zoom) * 20; // Increase the multiplier if needed

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

        marker.on("click", () => {
          L.popup()
            .setLatLng([tree.latitude, tree.longitude])
            .setContent(
              `
              <div>
                <h3>${tree.treeName}</h3>
                <p>${tree.descs ? (tree.descs.length > 50 ? tree.descs.substring(0, 50) + "..." : tree.descs) : "No description"}</p>
                <button onclick="window.navigateToTree(${tree.treeId})">Detay</button>
              </div>
            `
            )
            .openOn(map);
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
    // Add this to the global scope to handle popup button clicks
    window.navigateToTree = (treeId) => {
      navigate(`/Trees/${treeId}`);
    };
  }, []);

  const loadMoreTrees = () => {
    // Burada sunucudan daha fazla ağaç verisi yükleyebilirsiniz
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <Layout>
      <Content
        style={{
          minHeight: 280,
        }}
      >
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
          <div className="mt-12">
            <List
              height={window.innerHeight - 100}
              itemCount={trees.data ? trees.data.length : 0}
              itemSize={350}
              width={window.innerWidth}
              onItemsRendered={({ visibleStopIndex }) => {
                if (visibleStopIndex === trees.data.length - 1) {
                  loadMoreTrees();
                }
              }}
            >
              {({ index, style }) => {
                const tree = trees.data[index];
                return (
                  <div style={style}>
                    <Card
                      onClick={() => navigate(`/Trees/${tree.treeId}`)}
                      style={{ width: 300, margin: "10px auto" }}
                      cover={<img alt="example" src={tree.photoUrl} />}
                    >
                      <Meta
                        avatar={<Avatar icon={<FaTree />} />}
                        title={tree.treeName}
                        description={tree.descs ? (tree.descs.length > 100 ? tree.descs.substring(0, 100) + "..." : tree.descs) : "No description available"}
                      />
                      <div className="flex flex-wrap gap-2 mt-5">
                        {tree.treeChoices.map((choice) => (
                          <div key={choice.choiceId} className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            {choice.choiceName}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                );
              }}
            </List>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default Maps;
