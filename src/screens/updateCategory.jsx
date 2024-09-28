import { useContext, useEffect, useState, useRef, useMemo } from "react";
import JoditEditor from "jodit-react";
import Choices from "../components/choices";
import ThemeContext from "../context";
import { sendRequest } from "../utils/requests";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { Layout, theme, notification } from "antd";

const { Content } = Layout;

function UpdateCategory() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { id } = useParams();
  const datas = useContext(ThemeContext);
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [image, setImage] = useState("");

  const editor = useRef(null);
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Kategori Açıklama...",
      height: 300,
    }),
    []
  );

  const token = localStorage.getItem("token");

  // Fetch the category data by id
  const fetchCategoryData = async () => {
    datas.setLoading(true);
    const response = await sendRequest("GET", `TreeCategories/${id}`, null);

    if (response.success) {
      const categoryData = response.data[0];
      setCategoryName(categoryData.name);
      setCategoryDescription(categoryData.description);
      setImage(categoryData.image || "");
      datas.setSelected(categoryData.choices);
    }
    datas.setLoading(false);
  };

  // Update the category data
  const updateCategoryData = async () => {
    datas.setLoading(true);
    const response = await sendRequest("PUT", `TreeCategories/${id}`, {
      name: categoryName,
      description: categoryDescription,
      image: image,
      ChoiceIds: datas.selected.map((choice) => choice.choiceId),
    });
    datas.setLoading(false);

    if (response.success) {
      notification.success({
        message: "Başarılı",
        description: "Kategori bilgileri başarıyla güncellendi.",
      });
      navigate("/categories");
    } else {
      notification.error({
        message: "Hata",
        description: "Kategori güncellenirken bir hata oluştu.",
      });
    }
  };

  // Fetch choices data
  const fetchChoicesData = async () => {
    datas.setLoading(true);
    const data = await sendRequest("GET", "Choices", null);
    datas.setLoading(false);
    datas.setData(data);
  };

  useEffect(() => {
    fetchCategoryData();
    fetchChoicesData();
  }, []);

  if (token === null) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout>
      <Content
        style={{
          margin: "24px 16px",
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <div className="flex flex-col space-y-4 w-full gap-5">
          <div className="flex justify-between items-center p-4">
            <div className="text-2xl font-bold text-slate-800">Kategori Güncelle</div>
          </div>

          <div className="flex flex-col justify-between gap-5">
            <input
              type="text"
              placeholder="Kategori Adı"
              className="p-3 w-full rounded-xl border-2 border-gray-200 shadow-lg"
              onChange={(e) => setCategoryName(e.target.value)}
              value={categoryName}
            />
            <JoditEditor ref={editor} value={categoryDescription} config={config} tabIndex={1} onBlur={(newContent) => setCategoryDescription(newContent)} />
            <input
              type="text"
              placeholder="Resim URL'i"
              className="p-3 w-full rounded-xl border-2 border-gray-200 shadow-lg"
              onChange={(e) => setImage(e.target.value)}
              value={image}
            />
          </div>

          <div className="py-1">
            {datas.data &&
              datas.data.data.map((item) => (
                <div key={item.mainTitleId} className="p-5 rounded-xl shadow-lg w-full gap-1 flex flex-col justify-between">
                  <p className="text-3xl font-light text-black py-4">{item.mainTitleName}</p>
                  {item.groupTitles.map((group) => (
                    <div key={group.groupTitleId}>
                      <Choices group={group} text={group.groupTitleName} />
                    </div>
                  ))}
                </div>
              ))}
          </div>

          <div className="flex items-center gap-5 w-full justify-end">
            <button className="bg-green-500 text-white p-3 w-full rounded-xl" onClick={updateCategoryData}>
              Güncelle
            </button>
          </div>
        </div>
      </Content>
    </Layout>
  );
}

export default UpdateCategory;
