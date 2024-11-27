import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  Alert,
  // Alert,
  Button,
  Col,
  DatePickerProps,
  Descriptions,
  Divider,
  Drawer,
  // Dropdown,
  Form,
  Input,
  InputNumber,
  // MenuProps,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  message,
} from "antd";
import local from "antd/es/locale/en_GB";
import Calendar from "@sbmdkl/nepali-datepicker-reactjs";
import Column from "antd/es/table/Column";
import { useEffect, useState } from "react";
import "../App.css";
import { useNavigate, useParams } from "react-router-dom";
import { Image } from "antd";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  Payment,
  addDhitoOfCustomer,
  addLilami,
  axiosInstance,
  burner,
  editCustomer,
  fetchCustomerInfo,
  postNewImage,
} from "../utils/bridge";
import axios, { AxiosError } from "axios";
import {
  BACKEND_API,
  MAINTAINANCE_MESSAGE,
  SERVER_MAINTAINACE,
  serverDeployStatus,
} from "../../config";
import Upload, { RcFile, UploadFile, UploadProps } from "antd/es/upload";
import { PlusOutlined } from "@ant-design/icons";
import {
  deleteStatementOfUser,
  fetchStatements,
} from "../utils/statement.repo";
import moment from "moment";

export interface dhitoAddDatatype {
  date: string;
  interestPercentage: number;
  principalAmount: number;
  productName: string;
}

export interface lilamiDataType {
  rate: number;
  image: string;
  remarks: string;
  date: { adDate: string; bsDate: string };
  dhittoId: string;
}

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function UserProfile() {
  const paramsData = useParams();
  const queryClient = useQueryClient();

  // const queryClient = useQueryClient();
  const [modalStatus, setModalstatus] = useState(false);
  const [paymentModelStatus, setPaymentModelStatus] = useState(false);
  const [billingModelStatus, setBillingModelStatus] = useState(false);
  const [statementModelStatus, setStatementModelStatus] = useState(false);
  const [userEditDrawer, setUserEditDrawer] = useState(false);
  const navigateTo = useNavigate();
  const [lilamiModel, setLilamiModel] = useState(false);
  const [loadingLilami, setLoadingLilami] = useState(false);

  const [amountTobePaid, setAmountTobePaid] = useState({
    principal: 0,
    interest: 0,
  });
  const [amountPaid, setAmountPaid] = useState(0);
  const [lastBal, setLastBal] = useState({ remainBal: 0, remainInt: 0 });
  const Session: string | null = localStorage.getItem("session");
  const userSession = JSON.parse(Session ?? "");
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [dhitoId, setDhitoId] = useState<string>("");
  const [saveDetailsBtn, setSaveDetailsBtn] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

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

  const {
    data: customerInfo,
    refetch: refetchCustomerInfo,
    isLoading,
  } = useQuery(
    "customerInfo",
    () => fetchCustomerInfo(paramsData.userId!, userSession?.token, pagination),
    {
      onSuccess: () => {
        setPreviewImage(customerInfo?.data.image);
      },
    }
  );

  const {
    data: statementsOfDhito,
    refetch,
    isLoading: statementloading,
  } = useQuery(
    "statements",
    () =>
      fetchStatements(
        paramsData?.userId ?? "1",
        dhitoId,
        userSession?.token,
        paginationStatement
      ),
    {
      enabled: dhitoId != "",
      retry: dhitoId != "",
    }
  );

  useEffect(() => {
    refetch();
  }, [statementModelStatus, dhitoId, refetch]);

  const [pagination, setPagination] = useState<{
    page: number;
    capacity: number;
  }>({ page: 1, capacity: 7 });

  const [paginationStatement, setPaginationStatement] = useState<{
    page: number;
    capacity: number;
  }>({ page: 1, capacity: 7 });

  useEffect(() => {
    refetch();
    refetchCustomerInfo();
  }, [refetch, pagination, refetchCustomerInfo, paginationStatement]);

  const [form] = Form.useForm();
  const [editCustomeForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [lilamiForm] = Form.useForm();

  const handleModalSave = () => {
    form
      .validateFields()
      .then(() => {
        const mainData = {
          ...form.getFieldsValue(),
          date: new Date(form.getFieldsValue().date.adDate),
          bsDate: form.getFieldsValue().date.bsDate,
        };
        setLoadingBtn(true);
        addDhittosMutation.mutate(mainData);
      })
      .catch((error) => {
        console.error("Form validation failed:", error);
      });
  };

  const handleEditCustomer = () => {
    editCustomeForm.validateFields().then(() => {
      editCustomerMutation.mutate(paramsData?.userId ?? "1");
    });
  };

  const handlePayment = () => {
    paymentForm
      .validateFields()
      .then(() => {
        addPayemntMutation.mutate(dhitoId!);
      })
      .catch((error) => {
        console.error("Form validation failed:", error);
      });
  };

  const addPayemntMutation = useMutation(
    (dhitoId: string) => {
      return Payment(
        dhitoId,
        paramsData.userId!,
        paymentForm.getFieldsValue().date.bsDate,
        paymentForm.getFieldsValue(),
        userSession?.token
      );
    },
    {
      onSuccess: (res) => {
        message.success("Payment Done");
        refetch();
        setOpenBill(true);
        paymentForm.resetFields();
        refetchCustomerInfo();
        setAmountPaid(0);
        setBillLink(`${BACKEND_API}/uploads/${res.data.data}/payments`);
        axios
          .get(`${BACKEND_API}/uploads/${res.data.data}/payments`)
          .then((res) => {
            setHtmlCode(res.data);
            setOpenBill(true);
          });
      },
      onError: (err) => {
        console.log("this is err", err);
      },
      onSettled: () => {
        setPaymentModelStatus(false);
      },
    }
  );

  const editCustomerMutation = useMutation(
    (customerId: string) => {
      const customerData = editCustomeForm.getFieldsValue();
      const finalData = { ...customerData, image: hashImage.image };
      return editCustomer(customerId, finalData, userSession.token);
    },
    {
      onSuccess: () => {
        message.success("User Edit Success");
        onClose();
        queryClient.invalidateQueries(["customerInfo"]);
        editCustomeForm.resetFields();
      },
    }
  );

  useEffect(() => {
    const interest = amountTobePaid.interest;
    const principal = amountTobePaid.principal;
    let remain = amountPaid - interest;

    // Ensure remain is not negative
    remain = remain >= 0 ? remain : 0;
    if (remain > principal) {
      setLastBal({ remainBal: principal, remainInt: interest });
    } else if (remain > 0) {
      setLastBal({ remainBal: remain, remainInt: interest });
    } else {
      setLastBal({ remainBal: 0, remainInt: amountPaid });
    }
  }, [amountTobePaid, amountPaid]);

  const onChange: DatePickerProps["onChange"] = (date) => {
    console.log(date);
  };

  const showDrawer = () => {
    setFileList([
      {
        uid: customerInfo?.data.id,
        thumbUrl: customerInfo?.data.image,
        name: customerInfo?.data.fullName,
      },
    ]);
    setHashImage({ image: customerInfo?.data.image });
    setUserEditDrawer(true);
  };

  const onClose = () => {
    setUserEditDrawer(false);
  };

  const addDhittosMutation = useMutation(
    (dhitoData: dhitoAddDatatype) => {
      return addDhitoOfCustomer(
        { ...dhitoData, principalAmount: +dhitoData.principalAmount },
        customerInfo?.data.id,
        userSession?.token
      );
    },
    {
      onSuccess: () => {
        setModalstatus(false);
        form.resetFields();
        refetch();
        refetchCustomerInfo();
        setLoadingBtn(false);
        message.success("Dhito Added Successfully");
      },
      onError: (msg: AxiosError<{ message: string }>) => {
        setLoadingBtn(false);
        message.error(msg!.response!.data!.message);
      },
    }
  );
  const [billLink, setBillLink] = useState<string>("");
  const [htmlCode, setHtmlCode] = useState("");

  const viewBill = async (id: string) => {
    burner(id, userSession?.token).then((res) => {
      setBillLink(`${BACKEND_API}/uploads/${res.data.data}/dhittos`);
      axios
        .get(`${BACKEND_API}/uploads/${res.data.data}/dhittos`)
        .then((res) => {
          setHtmlCode(res.data);
          setBillingModelStatus(true);
        });
    });
  };
  // viewBill("123"); // just a mock
  const [openBill, setOpenBill] = useState(false);

  // for lilami

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [hashImage, setHashImage] = useState<{ image: string }>({ image: "" });

  const handleCancel = () => setPreviewOpen(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const addImage = new FormData();

  const handleChange: UploadProps["onChange"] = ({
    file: newFile,
    fileList,
  }) => {
    setFileList([]);
    setFileList(fileList);
    if (!fileList.length) {
      return;
    }
    // @ts-expect-error new file add garna dena so :)
    addImage.append("file", newFile);
    postNewImage(addImage, userSession.token).then((res) => {
      setHashImage(res.data);
    });
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const dhitoLilami = () => {
    lilamiForm
      .validateFields()
      .then(() => {
        setLoadingLilami(true);
        const finalData = lilamiForm.getFieldsValue();
        addLilamiMutation.mutate(finalData, {
          onSuccess() {
            setLilamiModel(false);
            refetchCustomerInfo();
            lilamiForm.resetFields();
            setFileList([]);
          },

          onSettled() {
            setLoadingLilami(false);
          },
        });
      })
      .catch((error) => {
        console.error("Form validation failed:", error);
      });
  };

  // Function to check if `updateAt` is within the 60-day limit
  function isWithin60Days(updateAt: string | Date): boolean {
    const diffInTime = new Date().getTime() - new Date(updateAt).getTime(); // Ensure `.getTime()` is called
    const diffInDays = diffInTime / (1000 * 60 * 60 * 24);
    const MAX_DAYS = 60; // Define MAX_DAYS if not already defined
    return diffInDays >= MAX_DAYS;
    // if >= then auction will hide because it checks for the 60 days, Else <= will show auction
  }

  const deleteStatementMutation = useMutation(
    (statementData: {
      customerId: string;
      dhitosId: string;
      statementId: string;
    }) => {
      return deleteStatementOfUser(
        statementData.customerId,
        statementData.dhitosId,
        statementData.statementId,
        userSession?.token
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["statements"]);
      },
    }
  );

  const addLilamiMutation = useMutation((lilamiData: lilamiDataType) => {
    const finalData = {
      ...lilamiData,
      rate: +lilamiData.rate,
      image: hashImage.image,
      dhittoId: dhitoId,
    };
    return addLilami(finalData, userSession?.token);
  });

  return (
    <>
      {SERVER_MAINTAINACE && (
        <Alert
          message={MAINTAINANCE_MESSAGE.title}
          description={MAINTAINANCE_MESSAGE.description}
          type={MAINTAINANCE_MESSAGE.type}
          closable
          showIcon
        />
      )}
      {contextHolder}
      <Spin
        tip="Loading..."
        size="large"
        spinning={isLoading || statementloading}
        fullscreen={isLoading || statementloading}
      >
        <div
          style={{
            padding: 24,
            minHeight: 380,
          }}
        >
          <div
            className="desarrow"
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 15,
                alignItems: "center",
              }}
            >
              <ArrowLeftOutlined
                style={{ fontSize: 25 }}
                onClick={() => {
                  navigateTo("/dhito");
                }}
              />
              <Tag
                color="#172C69"
                style={{ height: 40, fontSize: 20, padding: 10 }}
              >
                Customer Identification: {customerInfo?.data.identity}
              </Tag>

              <Descriptions
                // title="Client Information"
                layout="vertical"
                extra={
                  <div>
                    <Button
                      style={{ marginLeft: "auto" }}
                      type="primary"
                      onClick={() => {
                        showDrawer();
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                }
              ></Descriptions>
            </div>
          </div>
          <Descriptions column={4} layout="vertical" bordered>
            <Descriptions.Item label="User Image">
              <Image width={100} src={customerInfo?.data.image} />
            </Descriptions.Item>
            <Descriptions.Item label="Full Name">
              {customerInfo?.data.fullName}
            </Descriptions.Item>

            <Descriptions.Item label="Address ">
              {customerInfo?.data.address}
            </Descriptions.Item>
            <Descriptions.Item label="Contact Number">
              {customerInfo?.data.phoneNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Email Address">
              {customerInfo?.data.email}
            </Descriptions.Item>
            <Descriptions.Item label="Total Principal Amount">
              <b> Rs. {customerInfo?.data.totalPrincipal.toFixed()}</b>
            </Descriptions.Item>
            <Descriptions.Item label="Total Acquired Interest Amount">
              <b> Rs. {customerInfo?.data.totalInterest.toFixed()}</b>
            </Descriptions.Item>
          </Descriptions>
          <div style={{ marginTop: 10 }}>
            <Descriptions
              title="Dhito Statement"
              layout="vertical"
              extra={
                <div>
                  <Button
                    type="primary"
                    onClick={() => {
                      setModalstatus(true);
                    }}
                  >
                    Make New Loan
                  </Button>
                </div>
              }
            ></Descriptions>

            <Table
              loading={isLoading}
              scroll={{ y: 240 }}
              pagination={{
                defaultPageSize: 7,
                total: customerInfo?.data.count,
              }}
              onChange={(pagination) => {
                setPagination((prev) => {
                  return {
                    ...prev,
                    page: +pagination.current!,
                  };
                });
              }}
              bordered
              sticky
              dataSource={customerInfo?.data.dhitto}
            >
              <Column
                width={100}
                sorter={true}
                title="S.N"
                dataIndex={"id"}
                render={(id) => (
                  <Tag color="pink">{id.substring(0, id.indexOf("-"))}</Tag>
                )}
              />
              <Column
                width={150}
                dataIndex={"date"}
                sorter={true}
                title="Date"
                render={(data) => {
                  if (data.date == null) {
                    return (
                      moment(data.createdAt).format("YYYY-MM-DD") + " (AD)"
                    );
                  } else {
                    return data.date;
                  }
                }}
              />
              <Column
                width={200}
                sorter={true}
                dataIndex={"productName"}
                title="Collateral Item"
              />

              <Column
                width={150}
                sorter={true}
                dataIndex={"DhittoAccumulation"}
                title="Principal Amount"
                render={(DhittoAccumulation) => (
                  <p>{DhittoAccumulation.accPrincipal}</p>
                )}
              />
              <Column
                width={150}
                sorter={true}
                dataIndex={"DhittoAccumulation"}
                title="Acquired Interest"
                render={(DhittoAccumulation) => (
                  <p>{DhittoAccumulation.accInterest}</p>
                )}
              />

              <Column
                width={150}
                sorter={true}
                dataIndex={"interestPercentage"}
                title="Interest (%)"
              />
              <Column
                width={350}
                sorter={true}
                title="Action"
                render={(data) => {
                  if (data.status === "LILAMI") {
                    return (
                      <Space align="center">
                        <Tag
                          onClick={() => {
                            message.info("This Product is Auctioned ");
                          }}
                          color="red"
                        >
                          !!! Auctioned !!!
                        </Tag>
                      </Space>
                    );
                  } else if (data.status === "SETTLED") {
                    return (
                      <Space align="center">
                        <Tag
                          color="#87d068"
                          onClick={() => {
                            setDhitoId(data.id);
                            setStatementModelStatus(true);
                          }}
                        >
                          Statement
                        </Tag>
                        <Tag
                          onClick={() => {
                            message.info("This Loan Has Been Settled ");
                          }}
                          color="Green"
                        >
                          !!! Laon Settled !!!
                        </Tag>
                      </Space>
                    );
                  }
                  return (
                    <Space size="middle">
                      <Tag
                        color="#87d068"
                        onClick={() => {
                          setDhitoId(data.id);
                          setStatementModelStatus(true);
                        }}
                      >
                        Statement
                      </Tag>
                      <Tag
                        color="#f50"
                        onClick={() => {
                          setAmountTobePaid({
                            principal: data.DhittoAccumulation?.accPrincipal,
                            interest: data.DhittoAccumulation?.accInterest,
                          });
                          setDhitoId(data.id);
                          setPaymentModelStatus(true);
                        }}
                      >
                        Payment
                      </Tag>
                      <Tag
                        color="#108ee9"
                        onClick={() => {
                          viewBill(data.id);
                        }}
                      >
                        View Bill
                      </Tag>
                      {/* {console.log()} */}
                      {data.DhittoAccumulation.updatedAt &&
                        isWithin60Days(data.DhittoAccumulation.updatedAt) && (
                          <Popconfirm
                            placement="topLeft"
                            title="Send TO Auction!!!"
                            description={`Are You Sure Want to lilami ${data.productName}`}
                            onConfirm={() =>
                              new Promise<void>((resolve) => {
                                setTimeout(() => {
                                  setLilamiModel(true);
                                  setDhitoId(data.id);
                                  resolve(); // Resolve the promise to indicate the operation is completed
                                }, 1000);
                              })
                            }
                            cancelText="No"
                          >
                            <Tag color="red">Auction</Tag>
                          </Popconfirm>
                        )}

                      <Popconfirm
                        placement="topLeft"
                        title="Send Payment Notification!!!"
                        description={`Are You Sure Want to Send Payment Notification `}
                        onConfirm={() =>
                          new Promise<void>((resolve) => {
                            setTimeout(() => {
                              // setLilamiModel(true);
                              // setDhitoId(data.id);
                              // HTML email content dynamically populated
                              const emailHTML = `
                                <!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>Payment Reminder</title>
                                </head>
                                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
                                    <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                                        <h2 style="color: #555;">Payment Reminder – Outstanding Principal and Interest</h2>
                                        <p>Dear <strong>${customerInfo?.data.fullName}</strong>,</p>
                                        <p>I hope this message finds you well.</p>
                                        <p>This is a friendly reminder regarding your outstanding payment with us. As of now, the following amounts remain unpaid:</p>
                                        <ul style="list-style-type: none; padding: 0;">
                                            <li><strong>Principal Amount:</strong> Rs.${data.DhittoAccumulation.accPrincipal}</li>
                                            <li><strong>Interest:</strong> Rs.${data.DhittoAccumulation.accInterest}</li>
                                        </ul>
                                        <p>We kindly request that you make the payment at your earliest convenience to avoid any inconvenience. Please note that if payment is not received within the <strong>60 days</strong> of your last activity on your statement, your <strong><em>${data.productName}</em></strong> will be subject to auction as per our terms and conditions.</p>
                                       
                                        <p>If you have already made the payment, please disregard this email. Should you have any questions or need assistance, feel free to contact us.</p>
                                        <p>Thank you for your prompt attention to this matter.</p>
                                        <p>Best regards,</p>
                                        <p><strong>Brave Lender</strong></p>
                                    </div>
                                </body>
                                </html>
                              `;
                              messageApi.open({
                                type: "success",
                                content: "Payment Notification Sent !!! ",
                              });
                              axiosInstance
                                .post(`${BACKEND_API}/sendEmail`, {
                                  to: customerInfo?.data.email, // Customer's email address
                                  subject:
                                    "Payment Reminder – Outstanding Principal and Interest", // Subject of the email
                                  text: emailHTML, // Use the HTML email content
                                })
                                .then((res) => {
                                  if (res.status === 201) {
                                    // setBillingModelStatus(false);
                                    setLoadingBtn(false);
                                  } else {
                                    alert(res.data);
                                  }
                                })
                                .catch((err) => {
                                  console.error(err);
                                  alert("Failed to send email.");
                                });

                              resolve(); // Resolve the promise to indicate the operation is completed
                            }, 1000);
                          })
                        }
                        cancelText="No"
                      >
                        <Tag color="gray">Payment Notify</Tag>
                      </Popconfirm>
                    </Space>
                  );
                }}
              />
            </Table>
            <Modal
              open={lilamiModel}
              onCancel={() => {
                setLilamiModel(false);
              }}
              title={"Details Of Lilami"}
              footer={[
                <Button
                  key="SaveLilami"
                  type="primary"
                  loading={loadingLilami}
                  disabled={!fileList.length}
                  onClick={dhitoLilami}
                >
                  Save Lilami
                </Button>,
                <Button
                  key="cancel"
                  onClick={() => {
                    setLilamiModel(false);
                  }}
                >
                  Cancel
                </Button>,
              ]}
            >
              <Form layout="vertical" form={lilamiForm}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="date"
                      label="Date"
                      rules={[
                        { required: true, message: "Please enter full name" },
                      ]}
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
                          padding: "7px 11px",
                          borderRadius: "8px",
                          fontFamily: "poppins",
                          fontSize: "16px",
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="rate"
                      key={"rate"}
                      label="Rate"
                      rules={[{ required: true, message: "Please enter rate" }]}
                    >
                      <Input type="number" placeholder="Please enter rate" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="remarks"
                      label="Remarks"
                      rules={[
                        {
                          required: true,
                          message: "Please enter Remarks",
                        },
                      ]}
                    >
                      <Input.TextArea
                        allowClear
                        placeholder="Please enter Remarks"
                        className="contact"
                      />
                    </Form.Item>
                  </Col>

                  <Form.Item
                    name="image"
                    // initialValue={hashImage}
                    required={true}
                    label="User image"
                  >
                    <Upload
                      beforeUpload={(file) => {
                        const isPNG =
                          file.type === "image/png" ||
                          file.type === "image/jpeg";
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
                  <Modal
                    open={previewOpen}
                    footer={null}
                    onCancel={handleCancel}
                  >
                    <img
                      alt="example"
                      title={previewTitle}
                      style={{ width: "100%" }}
                      src={previewImage}
                    />
                  </Modal>
                </Row>
              </Form>
            </Modal>

            <Modal
              open={modalStatus}
              width={700}
              onCancel={() => {
                form.resetFields();
                setModalstatus(false);
              }}
              title="Add Dhito"
              footer={[
                <Button
                  key="Add Details"
                  type="primary"
                  loading={loadingBtn}
                  onClick={handleModalSave}
                  disabled={saveDetailsBtn}
                >
                  Save Details
                </Button>,
                <Button
                  key="Add Details"
                  onClick={() => {
                    setModalstatus(false);
                  }}
                >
                  Cancel
                </Button>,
              ]}
            >
              <Form form={form} layout="vertical" size="large">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="date"
                      label="Date"
                      rules={[{ required: true, message: "Please enter date" }]}
                    >
                      <Calendar
                        language="en"
                        locale={local}
                        onChange={onChange}
                        theme="deepdark"
                        style={{
                          width: "100%",
                          color: "black",
                          background: "transparent",
                          border: "1px solid #d9d9d9",
                          padding: "7px 11px",
                          borderRadius: "8px",
                          fontFamily: "poppins",
                          fontSize: "16px",
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="productcategory"
                      label="Product Category"
                      rules={[
                        {
                          required: true,
                          message: "Please total principal amount",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        // style={{ width: 200 }}
                        placeholder="Select Category for Collatroll"
                        optionFilterProp="label"
                        filterSort={(optionA, optionB) =>
                          (optionA?.label ?? "")
                            .toLowerCase()
                            .localeCompare((optionB?.label ?? "").toLowerCase())
                        }
                        options={[
                          {
                            value: "1",
                            label: "House = 80% ",
                          },
                          {
                            value: "2",
                            label: "Car / Vehicles = 60%",
                          },
                          {
                            value: "3",
                            label: "Property Papers = 70%",
                          },
                          {
                            value: "4",
                            label: "Business = 40%",
                          },
                          {
                            value: "5",
                            label: "Others = 30%",
                          },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="productName"
                      label="Collatroll Details"
                      rules={[
                        {
                          required: true,
                          message: "Please enter product details",
                        },
                      ]}
                    >
                      <Input placeholder="E.g: Car Reg Num: RG-100" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="productValuation"
                      label="Product Valuation"
                      rules={[
                        {
                          required: true,
                          message: "Please Enter total Valuation amount",
                        },
                      ]}
                    >
                      <Input type="number" placeholder="E.g: 10,000" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="principalAmount"
                      label="Principal amount"
                      rules={[
                        {
                          required: true,
                          message: "Please total principal amount",
                        },

                        () => ({
                          validator(_, value: number) {
                            const productvaluation = form.getFieldValue(
                              "productValuation"
                            ) as number;
                            const productcategory = form.getFieldValue(
                              "productcategory"
                            ) as keyof typeof categoryRatios;

                            // Ensure both fields are defined
                            if (
                              productvaluation == null ||
                              productcategory == null
                            ) {
                              return Promise.reject(
                                new Error(
                                  "Product valuation and category are required."
                                )
                              );
                            }

                            // Mapping of product categories to their target percentage values
                            const categoryRatios: { [key: number]: number } = {
                              1: 80, // house - 80%
                              2: 60, // car or vehicles - 60%
                              3: 70, // property - 70%
                              4: 40, // business - 40%
                              5: 30, // business - 30%
                            };

                            const percentage = categoryRatios[productcategory];

                            // Check if productcategory exists in categoryRatios and validate value
                            if (
                              percentage &&
                              value <= productvaluation * (percentage / 100)
                            ) {
                              setSaveDetailsBtn(false);
                              return Promise.resolve();
                            } else {
                              setSaveDetailsBtn(true);
                              return Promise.reject(
                                new Error(
                                  "Value must be less than the valuation of the collateral items."
                                )
                              );
                            }
                          },
                        }),
                      ]}
                    >
                      <Input type="number" placeholder="E.g: 10,000" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="interestPercentage"
                      label="Interest (%)"
                      rules={[
                        {
                          required: true,
                          message: " please enter interest Percentage",
                        },
                      ]}
                    >
                      <InputNumber
                        type="number"
                        min={1}
                        max={100}
                        addonAfter="%"
                        placeholder="E.g: 30"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Modal>
            <Modal
              open={paymentModelStatus}
              onCancel={() => {
                setPaymentModelStatus(false);
              }}
              title="Payment Details"
              footer={[
                <>
                  <Form form={paymentForm} layout="vertical">
                    <Form.Item name={"date"} hidden={true}>
                      <Calendar
                        locale={local}
                        onChange={onChange}
                        theme="deepdark"
                        style={{
                          display: "none",
                        }}
                      />
                    </Form.Item>
                    <Row>
                      <Col span={24}>
                        <Form.Item
                          name="amount"
                          label="Amount"
                          rules={[
                            {
                              required: true,
                              message: "Please Enter Total Amount",
                            },

                            () => ({
                              validator(_, value) {
                                const sum =
                                  amountTobePaid.interest +
                                  amountTobePaid.principal;
                                if (value === sum || value <= sum) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(
                                  new Error(
                                    "Value must be the sum of Principal Amount and Interest Amount or less than it"
                                  )
                                );
                              },
                            }),
                          ]}
                        >
                          <Input
                            min={0}
                            max={
                              amountTobePaid.interest + amountTobePaid.principal
                            }
                            maxLength={
                              (
                                amountTobePaid.interest +
                                amountTobePaid.principal
                              ).toString().length
                            }
                            type="number"
                            placeholder=" Enter amount"
                            value={amountPaid}
                            addonBefore={"Rs."}
                            onChange={(t) => {
                              setAmountPaid(+t.target.value);
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          label="Interest paid"
                          rules={[
                            {
                              required: true,
                              message: "please enter the interest ",
                            },
                          ]}
                        >
                          <Input
                            disabled={true}
                            addonBefore={"Rs."}
                            type="number"
                            value={lastBal.remainInt.toString()}
                            placeholder={lastBal.remainInt.toString()}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Form.Item
                          label="Principal paid"
                          rules={[
                            {
                              required: true,
                              message: "Please principal paid",
                            },
                          ]}
                        >
                          <Input
                            type="number"
                            disabled={true}
                            value={lastBal.remainBal.toString()}
                            addonBefore={"Rs."}
                            placeholder={lastBal.remainBal.toString()}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                  <Divider />

                  <Descriptions column={1} layout="horizontal" bordered>
                    <Descriptions.Item label="Total Principal Remaining">
                      Rs. {amountTobePaid.principal - lastBal.remainBal}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Interest Remaining">
                      Rs. {amountTobePaid.interest - lastBal.remainInt}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Amount to Paid">
                      NRs.
                      {customerInfo?.data.totalPrincipal +
                        customerInfo?.data.totalInterest}
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider />

                  <Button
                    key="Add Details"
                    onClick={handlePayment}
                    type="primary"
                  >
                    Save Payment
                  </Button>
                  <Button
                    key="Add Details"
                    onClick={() => {
                      setPaymentModelStatus(false);
                    }}
                  >
                    Cancel
                  </Button>
                </>,
              ]}
            ></Modal>
            <Modal
              width={1000}
              open={billingModelStatus}
              onCancel={() => {
                setBillingModelStatus(false);
              }}
              title="Billing"
              footer={[
                <Button
                  onClick={() => {
                    setLoadingBtn(true);
                    axiosInstance
                      .post(`${BACKEND_API}/sendEmail`, {
                        to: customerInfo?.data.email,
                        subject: "Bill For Loan",
                        text: htmlCode,
                      })
                      .then((res) => {
                        console.log(res);
                        if (res.status == 201) {
                          setBillingModelStatus(false);
                          setLoadingBtn(false);
                        } else {
                          alert(res.data);
                        }
                      });
                  }}
                  key="Add Details"
                  type="primary"
                  loading={loadingBtn}
                >
                  Send on Email
                </Button>,
                <Button
                  onClick={() => {
                    window.open(`${billLink}`, "_blank");
                  }}
                  key="Add Details"
                  type="primary"
                >
                  Print Bill
                </Button>,
                <Button
                  key="View Bill"
                  onClick={() => {
                    setBillingModelStatus(false);
                  }}
                >
                  Cancel
                </Button>,
              ]}
            >
              <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
            </Modal>
            <Modal
              open={statementModelStatus}
              onCancel={() => {
                setStatementModelStatus(false);
              }}
              width={1300}
              title="Statements"
              footer={[
                <Button
                  key="View Bill"
                  onClick={() => {
                    setStatementModelStatus(false);
                  }}
                >
                  Cancel
                </Button>,
              ]}
            >
              <Table
                scroll={{ x: 140 }}
                loading={statementloading}
                pagination={{
                  position: ["topRight"],
                  defaultPageSize: 7,
                  total: statementsOfDhito?.data.count,
                }}
                bordered
                sticky
                dataSource={statementsOfDhito?.data.data}
                onChange={(pagination) => {
                  setPaginationStatement({
                    page: +pagination.current!,
                    capacity: +pagination.defaultPageSize!,
                  });
                }}
                style={{ marginTop: 10 }}
              >
                <Column
                  width={100}
                  sorter={true}
                  title="Date"
                  key="date"
                  render={(data) => {
                    if (data.date == null) {
                      return (
                        moment(data.createdAt).format("YYYY-MM-DD") + " (AD)"
                      );
                    } else {
                      return data.bsDate;
                    }
                  }}
                />
                <Column
                  width={200}
                  title="Remarks"
                  dataIndex="remark"
                  key="remarks"
                />
                <Column
                  width={100}
                  title="Debit"
                  dataIndex="debit"
                  key="debit"
                />
                <Column
                  width={100}
                  title="Credit"
                  dataIndex="credit"
                  key="credit"
                />
                <Column
                  width={100}
                  title="Interest"
                  dataIndex="interest"
                  key="interest"
                />
                {serverDeployStatus && (
                  <Column
                    width={100}
                    title="Action"
                    render={(data) => {
                      return (
                        <Space size="middle">
                          <Popconfirm
                            placement="topLeft"
                            title="Delete!!!"
                            description="Are You Sure Want to Delete"
                            onConfirm={() =>
                              new Promise<void>((resolve) => {
                                setTimeout(() => {
                                  deleteStatementMutation.mutate({
                                    customerId: paramsData.userId!,
                                    dhitosId: data.dhittoId,
                                    statementId: data.id,
                                  });
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
                    key="interest"
                  />
                )}
              </Table>
            </Modal>
            <Drawer
              title="Edit Client details"
              size="large"
              placement="right"
              onClose={onClose}
              open={userEditDrawer}
              extra={
                <Space>
                  <Button onClick={handleEditCustomer} type="primary">
                    Save
                  </Button>
                </Space>
              }
            >
              <Form
                layout="vertical"
                form={editCustomeForm}
                initialValues={customerInfo?.data}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="fullName"
                      label="Full Name"
                      rules={[
                        { required: true, message: "Please enter full name" },
                      ]}
                    >
                      <Input placeholder="Please enter Full Name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="address"
                      label="Address"
                      rules={[
                        { required: true, message: "Please enter address" },
                      ]}
                    >
                      <Input placeholder="Please enter address" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="phoneNumber"
                      label="Contact"
                      rules={[
                        {
                          required: true,
                          message: "Please enter contact details",
                        },
                      ]}
                    >
                      <Input
                        type="PhoneNumber"
                        min={1}
                        max={10}
                        placeholder="Please enter contact details"
                        className="contact"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label="Email Address"
                      rules={[
                        {
                          required: true,
                          message: "Please enter Email Address",
                        },
                      ]}
                    >
                      <Input
                        type="email"
                        placeholder="Please enter Email Address"
                        className="contact"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item
                      name="image"
                      rules={[
                        {
                          required: true,
                          message: "Please Upload Image",
                        },
                      ]}
                      label="User image"
                    >
                      <Upload
                        beforeUpload={(file) => {
                          const isPNG =
                            file.type === "image/png" ||
                            file.type === "image/jpeg";
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
                  </Col>
                </Row>
              </Form>
            </Drawer>
            <Modal
              title="Billing"
              open={openBill}
              width={1000}
              onCancel={() => {
                setOpenBill(false);
              }}
              footer={[
                <Button
                  onClick={() => {
                    setLoadingBtn(true);
                    axiosInstance
                      .post(`${BACKEND_API}/sendEmail`, {
                        to: customerInfo?.data.email,
                        subject: "Bill For Payment",
                        text: htmlCode,
                      })
                      .then((res) => {
                        console.log(res);
                        if (res.status == 201) {
                          setOpenBill(false);
                          setLoadingBtn(false);
                        } else {
                          alert(res.data);
                        }
                      });
                  }}
                  key="Add Details"
                  type="primary"
                  loading={loadingBtn}
                >
                  Send on Email
                </Button>,
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
              ]}
            >
              <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
            </Modal>
          </div>
        </div>
      </Spin>
      <Modal open={previewOpen} footer={null} onCancel={handleCancel}>
        <img
          alt="example"
          title={previewTitle}
          style={{ width: "100%" }}
          src={previewImage}
        />
      </Modal>
    </>
  );
}
