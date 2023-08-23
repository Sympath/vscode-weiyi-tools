import SchemaForm from "@/components/SchemaForm";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { AddSchema, ActionSchema } from "./form-schema";

export const AddAction = () => {
  const handleClick = () => {
    Modal.confirm({
      title: "add",
      width: 700,
      icon: null,
      content: <SchemaForm schema={AddSchema} />,
    });
  };

  return (
    <Button type="primary" icon={<PlusOutlined />} onClick={handleClick}>
      Add
    </Button>
  );
};
export const ActionAction = () => {
  const handleClick = () => {
    Modal.confirm({
      title: "ActionSchema",
      width: 700,
      icon: null,
      content: <SchemaForm schema={ActionSchema} />,
    });
  };

  return <Button onClick={handleClick}>c</Button>;
};
