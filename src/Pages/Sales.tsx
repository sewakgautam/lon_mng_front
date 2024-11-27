import {
  Button,
  Card,
  Col,
  DatePickerProps,
  FloatButton,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import local from "antd/es/locale/ne_NP";
import Calendar from "@sbmdkl/nepali-datepicker-reactjs";
import "@sbmdkl/nepali-datepicker-reactjs/dist/index.css";
import Column from "antd/es/table/Column";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { CloseOutlined } from "@ant-design/icons";

import axios from "axios";
import { BACKEND_API } from "../../config";
import {
  FormDataItem,
  SalesDataType,
  deleteSales,
  fetchSalesData,
  sendSalesData,
} from "../utils/sales.repo";
import { burner, PaginationType } from "../utils/bridge";

interface DataType {
  id: string;
  fullName: string;
  panNo: string;
  address: string;
  totalAmount: string;
}

function Sales() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onChange: DatePickerProps["onChange"] = (date) => {
    console.log(date);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleModalSave = () => {
    form
      .validateFields()
      .then(() => {
        const mainData = {
          ...form.getFieldsValue(),
          date: new Date(form.getFieldsValue().date.adDate),
          bsDate: form.getFieldsValue().date.bsDate,
        };
        addSalesMutaiton.mutate(mainData);
        setFormData([
          {
            description: "string",
            rate: 0,
            makingCharge: 0,
            weight: 0,
            mfgCost: 0,
            amount: 0,
            total: 0,
          },
        ]);
      })
      .catch((error) => {
        console.error("Form validation failed:", error);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setFormData([
      {
        description: "string",
        rate: 0,
        makingCharge: 0,
        weight: 0,
        mfgCost: 0,
        amount: 0,
        total: 0,
      },
    ]);
  };

  const handleSecondModalCancel = () => {
    setOpenBill(false);
  };

  // todo: this function will be implemented once backend  is completed

  // const iframeRef = useRef();
  // function handlePrintButtonClick(htmlUrl: string) {
  //   window.open(htmlUrl, "_blank");
  // }

  const Session: string | null = localStorage.getItem("session");
  const userSession = JSON.parse(Session ?? "");

  const {
    data: salesData,
    isLoading,
    refetch,
  } = useQuery("salesData", () =>
    fetchSalesData(userSession?.token, pagination)
  );

  const addSalesMutaiton = useMutation(
    (salesData: SalesDataType) => {
      const final = {
        ...salesData,
        goods: formData,
      };
      console.log(final);
      return sendSalesData(final, userSession?.token);
    },
    {
      onSuccess: (res) => {
        message.success("Submit success!");
        queryClient.invalidateQueries(["salesData"]);
        setIsModalOpen(false);
        form.resetFields();
        setBillLink(`${BACKEND_API}/uploads/${res.data.data}/sales`);
        axios
          .get(`${BACKEND_API}/uploads/${res.data.data}/sales`)
          .then((res) => {
            setHtmlCode(res.data);
            setOpenBill(true);
          });

        // window.open(`${BACKEND_API}/uploads/${res.data.data}/sales`);
      },
      onError: () => {},
    }
  );

  const deleteSaleDataMutation = useMutation(
    (salesId: string) => {
      return deleteSales(salesId, userSession?.token);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["salesData"]);
        form.resetFields();
      },
    }
  );

  const [form] = Form.useForm();

  //test

  const [formData, setFormData] = useState<FormDataItem[]>([]);

  const checkData = () => {
    // setFormData(form.getFieldsValue().goods);
    console.log(form.getFieldsValue().goods);
    computedGood(form.getFieldsValue().goods);
  };

  const computedGood = (goods: FormDataItem[]) => {
    const finalData = goods.map((good: FormDataItem) => {
      // Ensure that rate, weight, and makingCharge are valid numbers
      if (!good.rate || !good.weight) {
        return {
          ...good,
          description: "",
          amount: 0,
          total: 0,
          mfgCost: 0,
        };
      }

      const perGram = good.rate / 11.664;

      // Ensure that weight is a valid number
      if (!good.weight) {
        return {
          ...good,
          description: "",
          amount: 0,
          total: 0,
          mfgCost: 0,
        };
      }

      const costOfWeight = perGram * good.weight;

      let mfgCost = 0;

      if (good.mfgCost) {
        mfgCost = good.mfgCost;
      } else {
        mfgCost = costOfWeight * 0.09;
      }

      const total = costOfWeight + mfgCost + good.makingCharge;

      return {
        ...good,
        amount: costOfWeight,
        total,
        mfgCost,
      };
    });

    setFormData(finalData);
    return finalData;
  };

  // console.log(computedGoods(form.getFieldsValue().goods));

  const [billLink, setBillLink] = useState<string>("");
  const [openBill, setOpenBill] = useState(false);
  const [htmlCode, setHtmlCode] = useState("");

  const viewBill = async (id: string) => {
    burner(id, userSession?.token).then((res) => {
      setBillLink(`${BACKEND_API}/uploads/${res.data.data}/sales`);

      axios.get(`${BACKEND_API}/uploads/${res.data.data}/sales`).then((res) => {
        setHtmlCode(res.data);
        setOpenBill(true);
      });

      // window.open(
      //   `${BACKEND_API}/uploads/${res.data.data}/sales`,
      //   "_blank"
      // );
    });
  };

  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    capacity: 7,
  });

  useEffect(() => {
    refetch();
  }, [pagination, refetch]);

  return (
    <>
      <Table
        scroll={{ x: 140 }}
        loading={isLoading}
        bordered
        sticky
        pagination={{
          position: ["topRight"],
          defaultPageSize: 7,
          total: salesData?.data.count,
        }}
        onChange={(pagination) => {
          setPagination({
            page: +pagination.current!,
            capacity: +pagination.defaultPageSize!,
          });
        }}
        dataSource={salesData?.data.data}
        style={{ margin: 30 }}
      >
        <Column
          width={75}
          sorter={true}
          title="S.N"
          dataIndex={"id"}
          render={(id) => (
            <Tag color="green">{id.substring(0, id.indexOf("-"))}</Tag>
          )}
        />
        <Column
          width={200}
          sorter={true}
          dataIndex={"fullName"}
          title="Buyer name"
          key="buyername"
        />
        <Column
          width={150}
          title="address"
          dataIndex={"address"}
          key="description"
        />
        <Column
          width={200}
          title="Contact Number"
          dataIndex={"contactNumber"}
          key="description"
        />
        <Column
          width={150}
          title="Pan No"
          dataIndex={"panNo"}
          key="description"
        />

        <Column
          width={150}
          sorter={true}
          title="Total Amount"
          dataIndex={"totalAmount"}
          key="totalamount"
        />

        <Column
          width={150}
          title="Action"
          key={"status"}
          render={(record: DataType) => (
            <Space size="middle">
              <Tag
                color="#108ee9"
                onClick={() => {
                  viewBill(record.id);
                }}
              >
                View Bill
              </Tag>
              <Popconfirm
                placement="topLeft"
                title="Delete!!!"
                description="Are You Sure Want to Delete"
                onConfirm={() =>
                  new Promise<void>((resolve) => {
                    setTimeout(() => {
                      deleteSaleDataMutation.mutate(record.id);
                      message.success("Delete Successfully !!!");
                      resolve(); // Resolve the promise to indicate the operation is completed
                    }, 2000);
                  })
                }
                cancelText="No"
              >
                <div>
                  <Tag color="#f50">Delete</Tag>
                </div>
              </Popconfirm>
            </Space>
          )}
        />
      </Table>
      <FloatButton
        shape="circle"
        type="primary"
        style={{ right: 24 }}
        onClick={showModal}
        icon={<PlusCircleOutlined />}
      />
      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="save"
            htmlType="submit"
            type="primary"
            onClick={handleModalSave}
          >
            Save
          </Button>,
        ]}
        width={1000}
        title="Add Buying Details"
      >
        <div>
          <Form
            form={form}
            name="dynamic_form_complex"
            autoComplete="off"
            initialValues={{ panNo: "-", goods: [{}] }}
          >
            <Row gutter={16}>
              <Col span={14}>
                <Form.Item
                  validateDebounce={1000}
                  name="fullName"
                  label="Customer Name"
                  rules={[
                    { required: true, message: "Please enter Buyer name" },
                  ]}
                >
                  <Input placeholder=" E.g: Ramesh Khanal" />
                </Form.Item>
              </Col>

              <Col span={10}>
                <Form.Item
                  name="address"
                  label="Address"
                  rules={[
                    { required: true, message: "Please enter Buyer Address" },
                  ]}
                >
                  <Input placeholder="E.g: Belbari-10 Morang" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={27}>
              <Col span={10}>
                <Form.Item
                  name="contactNumber"
                  label="Phone Number"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Buyer Contact Number",
                    },
                  ]}
                >
                  <Input type="number" placeholder="E.g: 9804000001" />
                </Form.Item>
              </Col>

              <Col span={7}>
                <Form.Item name="panNo" label="Pan No">
                  <Input placeholder="Enter Pan No" />
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item
                  name="date"
                  label="Date"
                  rules={[{ required: true, message: "Please Pan No" }]}
                >
                  <Calendar
                    locale={local}
                    onChange={onChange}
                    theme="deepdark"
                    style={{
                      width: "100%",
                      color: "black",
                      background: "transparent",
                      border: "1px solid #d9d9d9",
                      padding: "4px 11px",
                      borderRadius: "6px",
                      fontFamily: "poppins",
                      fontSize: "14px",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.List name="goods">
              {(fields, { add, remove }) => (
                <div
                  style={{
                    display: "flex",
                    rowGap: "16px",
                    flexDirection: "column",
                  }}
                >
                  {fields.map((field) => (
                    <Card
                      size="small"
                      title={`Product ${field.name + 1}`}
                      key={field.key}
                      extra={
                        <CloseOutlined
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      }
                    >
                      <Row gutter={16}>
                        <Col span={16}>
                          <Form.Item
                            name={[field.name, "description"]}
                            label="Product Details"
                            rules={[
                              {
                                required: true,
                                message: "Please Add Product Description",
                              },
                            ]}
                          >
                            <Input placeholder="E.g: Earing is 24 carat" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name={[field.name, "weight"]}
                            label="Weight"
                            rules={[
                              {
                                required: true,
                                message: "Please add weight",
                              },
                            ]}
                          >
                            <InputNumber
                              onChange={checkData}
                              style={{ width: "100%" }}
                              placeholder="E.g: 2gm"
                              type="number"
                              addonAfter="grm"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            name={[field.name, "rate"]}
                            label="Rate"
                            rules={[
                              { required: true, message: "Please enter rate" },
                            ]}
                          >
                            <InputNumber
                              onChange={checkData}
                              addonBefore={"Rs."}
                              type="number"
                              style={{ width: "100%" }}
                              placeholder="E.g 1,12,000"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name={[field.name, "mfgCost"]}
                            label="Mfg.Cost "
                          >
                            <InputNumber
                              // disabled
                              addonBefore={"Rs"}
                              type="number"
                              style={{ width: "100%" }}
                              placeholder={formData[
                                field.name
                              ]?.mfgCost?.toString()}
                              onChange={checkData}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name={[field.name, "amount"]}
                            label="Amount"
                          >
                            <InputNumber
                              disabled
                              addonBefore={"Rs."}
                              style={{ width: "100%" }}
                              type="number"
                              placeholder={formData[
                                field.name
                              ]?.amount?.toString()}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            initialValue={0}
                            name={[field.name, "makingCharge"]}
                            label="Making Charges"
                          >
                            <InputNumber
                              onChange={checkData}
                              type="number"
                              addonBefore={"Rs."}
                              style={{ width: "100%" }}
                              placeholder="E.g: 200"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={16}>
                          <Form.Item
                            name={[field.name, "totalAmount"]}
                            label="Total amount"
                            style={{ fontSize: "bold" }}
                          >
                            <InputNumber
                              disabled
                              type="number"
                              addonBefore={"Rs."}
                              style={{ width: "100%" }}
                              placeholder={
                                formData[field.name]?.total?.toString() ?? "0"
                              }
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Nest Form.List */}
                    </Card>
                  ))}

                  <Button type="dashed" onClick={() => add()} block>
                    + Add Item
                  </Button>
                </div>
              )}
            </Form.List>
          </Form>
        </div>
      </Modal>

      <Modal
        title="Billing"
        open={openBill}
        width={1000}
        onCancel={() => {
          setOpenBill(false);
        }}
        footer={[
          <Button
            key="print"
            type="primary"
            onClick={() => {
              const printWindow = window.open(`${billLink}`, "_blank");
              if (printWindow) {
                printWindow.onload = () => {
                  printWindow.print();
                };
              }
            }}
          >
            Print Bill
          </Button>,
          <Button onClick={handleSecondModalCancel}>Cancel</Button>,
        ]}
      >
        <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
      </Modal>
    </>
  );
}
export default Sales;
