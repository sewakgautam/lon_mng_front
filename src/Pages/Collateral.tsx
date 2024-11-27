import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Col,
  Drawer,
  FloatButton,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import Search, { SearchProps } from "antd/es/input/Search";
import "../App.css";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Column from "antd/es/table/Column";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  CustomerDataType,
  addCustomer,
  deleteCustomer,
  fetchUsers,
  PaginationType,
  postNewImage,
} from "../utils/bridge";
import Upload, { RcFile, UploadFile, UploadProps } from "antd/es/upload";
import { AxiosError } from "axios";

// interface DataType {
//   key: React.Key;
//   customerName: string;
//   dateOfIssue: string;
//   totalprincipalAmount: number;
//   totalAcquiredInterest: number;
//   status: string;
// }

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

function Dhito() {
  const queryClient = useQueryClient();
  const navigateTo = useNavigate();
  const [form] = Form.useForm();
  const addImage = new FormData();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [formImage, setformImage] = useState<{ image: string }>({
    image:
      "https://i.pinimg.com/originals/7d/34/d9/7d34d9d53640af5cfd2614c57dfa7f13.png",
  });
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    capacity: 10,
  });

  const [loadingAddCustomer, setLoadingAddCustomer] = useState(false);

  const handleCancel = () => setPreviewOpen(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({
    file: newFile,
    fileList,
  }) => {
    console.log(fileList);
    setFileList(fileList);
    if (!fileList.length) {
      return;
    }
    // @ts-expect-error new file add garna dena so :)
    addImage.append("file", newFile);
    postNewImage(addImage, userSession.token).then((res) => {
      setformImage(res.data);
    });
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const [openCustomerAddDrawer, setOpenCustomerAddDrawer] = useState(false);

  const showDrawer = () => {
    setOpenCustomerAddDrawer(true);
  };

  const onClose = () => {
    setOpenCustomerAddDrawer(false);
  };

  const Session: string | null = localStorage.getItem("session");
  const userSession = JSON.parse(Session ?? "");

  const {
    data: customers,
    isLoading,
    refetch: refetchCustomer,
  } = useQuery("customersData", () =>
    fetchUsers(userSession?.token, pagination, searchValue)
  );

  const handleModalSave = () => {
    form
      .validateFields()
      .then(() => {
        const mainData = form.getFieldsValue();
        addCustomerMutation.mutate(mainData);
        setLoadingAddCustomer(true);
      })
      .catch((error) => {
        console.error("Form validation failed:", error);
      });
  };

  const deleteCustomerMutation = useMutation(
    (customerId: string) => {
      return deleteCustomer(customerId, userSession?.token);
    },
    {
      onSuccess: () => {
        message.success("Customer Deleted !!!");
        queryClient.invalidateQueries(["customersData"]);
      },
    }
  );

  const addCustomerMutation = useMutation(
    (customerData: CustomerDataType) => {
      const finalData = { ...customerData, image: formImage.image };
      return addCustomer(finalData, userSession?.token);
    },
    {
      onSuccess: () => {
        message.success("Customer Added success !!!");
        queryClient.invalidateQueries(["customersData"]);
        form.resetFields();
        setformImage({ image: "" });
        addImage.delete("file");
        onClose();
      },
      onError: (err: AxiosError<{ message: string }>) => {
        message.error(err?.response?.data?.message);
      },
      onSettled: () => {
        setLoadingAddCustomer(false);
      },
    }
  );

  const [searchValue, setSeachValue] = useState<string>("");

  const onSearch: SearchProps["onSearch"] = (value) => {
    setSeachValue(value);
    refetchCustomer();
  };

  useEffect(() => {
    refetchCustomer();
  }, [refetchCustomer, searchValue, pagination]);

  return (
    <div className="container">
      <Search
        placeholder="E.g: Ramesh / identity: 123"
        allowClear
        enterButton
        value={searchValue}
        onChange={(t) => {
          setSeachValue(t.target.value);
        }}
        size="large"
        onSearch={onSearch}
        style={{ width: "30%", float: "left" }}
      />
      <Table
        scroll={{ y: 600 }}
        dataSource={customers?.data.data}
        loading={isLoading}
        pagination={{
          position: ["topRight"],
          defaultPageSize: 7,
          total: customers?.data.count,
        }}
        onChange={(pagination) => {
          setPagination({
            page: pagination.current!,
            capacity: pagination.defaultPageSize!,
          });
          // queryClient.refetchQueries("customersData");
        }}
      >
        <Column
          title="User Id"
          responsive={["md"]}
          width={100}
          dataIndex={"id"}
          render={(id) => (
            <Tag color="red">{id.substring(0, id.indexOf("-"))}</Tag>
          )}
        ></Column>
        <Column
          title="Identity"
          responsive={["md"]}
          dataIndex={"identity"}
          render={(identity) => <Tag color="blue">{identity}</Tag>}
        ></Column>
        <Column
          title="Image"
          dataIndex="image"
          responsive={["md"]}
          render={(text) => <Avatar size={50} src={text} />}
        />
        <Column title="Customer Name" dataIndex="fullName"></Column>
        <Column
          responsive={["md"]}
          title="Principal Amount"
          dataIndex="totalPrincipal"
        ></Column>
        <Column
          responsive={["md"]}
          title="Acquired Interest"
          dataIndex="totalInterest"
        ></Column>
        <Column
          title="Action"
          render={(data) => {
            return (
              <Space size="middle">
                <Tag
                  color="#87d068"
                  onClick={() => {
                    navigateTo(`/dhito/${data.id}`, {
                      state: { key: data.id },
                    });
                  }}
                >
                  View Profile
                </Tag>
                <Popconfirm
                  placement="topLeft"
                  title="Delete!!!"
                  description="Are You Sure Want to Delete"
                  onConfirm={() =>
                    new Promise<void>((resolve) => {
                      setTimeout(() => {
                        deleteCustomerMutation.mutate(data?.id);
                        resolve(); // Resolve the promise to indicate the operation is completed
                      }, 2000);
                    })
                  }
                  okText="Yes"
                  cancelText="No"
                >
                  <div>
                    <Tag color="#f50">Delete</Tag>
                  </div>
                </Popconfirm>
              </Space>
            );
          }}
        ></Column>
      </Table>
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        onClick={showDrawer}
      />
      <Drawer
        title="Create new Client"
        size="large"
        placement="right"
        onClose={onClose}
        open={openCustomerAddDrawer}
        extra={
          <Space>
            <Button
              type="primary"
              onClick={handleModalSave}
              loading={loadingAddCustomer}
            >
              Add Customer
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Full Name"
                rules={[{ required: true, message: "Please enter full name" }]}
              >
                <Input placeholder="E.g: Ramesh khanal" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="address"
                key={"address"}
                label="Address"
                rules={[{ required: true, message: "Please enter address" }]}
              >
                <Input placeholder="E.g: Belbari" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Contact"
                rules={[
                  { required: true, message: "Please enter contact details" },
                ]}
              >
                <Input
                  type="number"
                  min={1}
                  max={10}
                  placeholder="E.g: 9804000000"
                  className="contact"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: "Please enter Email Address" },
                ]}
              >
                <Input type="email" placeholder="E.g: yourname@mail.com" />
              </Form.Item>
            </Col>
            <Form.Item name="image" label="User image">
              <Upload
                beforeUpload={(file) => {
                  const isPNG =
                    file.type === "image/png" || file.type === "image/jpeg";
                  if (!isPNG) {
                    message.error(`${file.name} is not a png file`);
                  }
                  return false;
                }}
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
              >
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
            </Form.Item>
            <Modal open={previewOpen} footer={null} onCancel={handleCancel}>
              <img
                alt="example"
                title={previewTitle}
                style={{ width: "100%" }}
                src={previewImage}
              />
            </Modal>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
}

export default Dhito;
