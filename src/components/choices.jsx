import React, { useContext, useEffect, useState } from "react";
import ThemeContext from "../context";
import { Select, Space } from "antd";
import { RiTreeFill } from "react-icons/ri";

const Choices = ({ group, text }) => {
  const datas = useContext(ThemeContext);
  const { selected, setSelected } = useContext(ThemeContext);

  const [options, setOptions] = useState([]);

  useEffect(() => {
    setOptions(
      group.choices.map((choice) => ({
        value: choice.choiceId,
        label: choice.choiceName,
        data: choice,
      }))
    );
  }, [group.choices]);

  const handleChange = (selectedItems) => {
    const newSelections = selectedItems
      .map((item) => ({ choiceId: item }))
      .filter((item) => !selected.some((selectedItem) => selectedItem.choiceId === item.choiceId));
    setSelected([...selected, ...newSelections]);
  };

  const handleDeselect = (deselectedItem) => {
    setSelected(selected.filter((item) => item.choiceId !== deselectedItem));
  };
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="w-full py-3">
        <Select
          mode="multiple"
          className="w-full rounded-xl"
          placeholder={text}
          onChange={handleChange}
          onDeselect={handleDeselect}
          optionLabelProp="label"
          options={options}
          optionRender={(option) => (
            <Space>
              <RiTreeFill />
              {option.label}
            </Space>
          )}
        />
      </div>
    </div>
  );
};

export default Choices;