import {
  FloatButton,
  Drawer,
  Form,
  Input,
  Table,
  Tooltip,
  Button,
  message,
  Space,
  Tag,
  Popconfirm,
  Select,
  Tabs,
  Card,
} from "antd";
import local from "antd/es/locale/ne_NP";
import Calendar from "@sbmdkl/nepali-datepicker-reactjs";

import Column from "antd/es/table/Column";
import {
  BankOutlined,
  PlusCircleOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  BankDataTypes,
  BankRecordDataTypes,
  createBank,
  createBankRecords,
  deleteBank,
  deleteBankRecords,
  fetchBank,
  fetchBankRecords,
  updateBankRecord,
} from "../utils/bank-record.repo";
import "../App.css";
import { PaginationType } from "../utils/bridge";
import Search, { SearchProps } from "antd/es/input/Search";
import moment from "moment";

interface YourDataItem {
  status: string; // Adjust the type according to your actual data structure
  id: string; // Assuming there's an 'id' property
  updatedAt?: string;
  identity: string;
  Bank: {
    id: string;
  };
  // Other properties...
}

export default function Locker() {
  const queryClient = useQueryClient();
  const [recordDrawerStatus, setRecordDrawerStatus] = useState(false);
  const [bankDrawerStatus, setBankDrawerStatus] = useState(false);
  const [loadingAddRecords, setLoadingAddRecords] = useState(false);
  const [loadingAddBank, setLoadingAddBank] = useState(false);
  const [searchValue, setSeachValue] = useState<string>("");
  const [bankId, setBankId] = useState<string>("");

  const onSearch: SearchProps["onSearch"] = (value) => {
    setSeachValue(value);
    refetch();
  };

  const showRecordDrawer = () => {
    setRecordDrawerStatus(true);
  };
  const onCloserecordDrawer = () => {
    setRecordDrawerStatus(false);
  };

  const showBankDrawer = () => {
    setBankDrawerStatus(true);
  };
  const onCloseBankDrawer = () => {
    setBankDrawerStatus(false);
  };

  const { Option } = Select;
  const update = useMutation(
    (obj: {
      bankId: string;
      bankRecordId: string;
      data: Partial<BankRecordDataTypes>;
    }) => {
      return updateBankRecord(
        obj.bankId,
        obj.bankRecordId,
        obj.data,
        userSession?.token
      );
    }
  );

  const handleModalSave = () => {
    form
      .validateFields()
      .then(() => {
        setLoadingAddRecords(true);
        console.log(form.getFieldsValue());
        const mainBankRecordData = {
          ...form.getFieldsValue(),
          createdDate: new Date(form.getFieldsValue().createdDate.adDate),
          bsDate: form.getFieldsValue().createdDate.bsDate,
          status: "ON_BANK",
        };

        addBankRecords.mutate(mainBankRecordData);
      })
      .catch((error) => {
        console.error("Form validation failed:", error);
      });
  };

  const handleBankSave = () => {
    bankForm
      .validateFields()
      .then(() => {
        setLoadingAddBank(true);
        addBank.mutate(bankForm.getFieldsValue());
      })
      .catch((error) => {
        console.error("Form validation failed:", error);
      });
  };

  const deleteBankRecordDataMutation = useMutation(
    (bankrecords: { bankId: string; bankRecordId: string }) => {
      return deleteBankRecords(
        bankrecords.bankId,
        bankrecords.bankRecordId,
        userSession?.token
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["bankData"]);
        message.success("Delete Successfully !!!");
      },
    }
  );

  const deleteBanks = useMutation(
    (bankId: string) => {
      return deleteBank(bankId, userSession?.token);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["banks"]);
        queryClient.invalidateQueries(["bankData"]);
      },
    }
  );

  const Session: string | null = localStorage.getItem("session");
  const userSession = JSON.parse(Session ?? "");

  const {
    data: bankRecordsData,
    refetch,
    isLoading,
  } = useQuery("bankData", () =>
    fetchBankRecords(userSession?.token, pagination, searchValue, bankId)
  );

  const {
    data: bank,
    refetch: refetchBanks,
    isLoading: bankLoading,
  } = useQuery("banks", () => fetchBank(userSession?.token));

  const addBank = useMutation(
    (bankData: BankDataTypes) => {
      return createBank(bankData, userSession?.token);
    },
    {
      onSuccess: () => {
        message.success("New Bank Added ");
        queryClient.invalidateQueries(["banks"]);
        refetchBanks();
        bankForm.resetFields();
        onCloseBankDrawer();
      },
      onSettled: () => {
        setLoadingAddBank(false);
      },
    }
  );

  const addBankRecords = useMutation(
    (bankRecordsData: BankRecordDataTypes) => {
      return createBankRecords(bankRecordsData, userSession?.token);
    },
    {
      onSuccess: () => {
        message.success("New Bank Record Added !!!");
        queryClient.invalidateQueries(["bankRecordsData"]);
        form.resetFields();
        refetch();
        onCloserecordDrawer();
      },
      onSettled: () => {
        setLoadingAddRecords(false);
      },
    }
  );

  const [form] = Form.useForm();
  const [bankForm] = Form.useForm();
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    capacity: 7,
  });

  useEffect(() => {
    refetch();
  }, [pagination, refetch, searchValue, bankId]);

  return (
    <div style={{ margin: 30 }}>
      <Tabs
        tabPosition={"top"}
        type="card"
        defaultActiveKey="1"
        animated
        items={[
          {
            key: "1",
            label: "My Banks",
            icon: <BankOutlined />,

            children: (
              <>
                <Table
                  loading={bankLoading}
                  bordered
                  scroll={{ x: 140 }}
                  sticky
                  pagination={{
                    position: ["topRight"],
                    defaultPageSize: 10,
                    total: bank?.data.count,
                  }}
                  dataSource={bank?.data}
                >
                  <Column
                    width={100}
                    title="S.N"
                    dataIndex={"id"}
                    render={(id) => (
                      <Tag color="orange">
                        {id.substring(0, id.indexOf("-"))}
                      </Tag>
                    )}
                  ></Column>
                  <Column
                    title="Bank Name"
                    dataIndex="name"
                    key={"bankname"}
                  ></Column>
                  <Column
                    title="Bank Address"
                    dataIndex="address"
                    key={"product name"}
                  ></Column>

                  <Column
                    width={200}
                    title="Action"
                    dataIndex="action"
                    key={"action"}
                    render={(_, record: BankRecordDataTypes) => (
                      <Space size="middle">
                        <Popconfirm
                          placement="topLeft"
                          title="Delete!!!"
                          description="Are You Sure Want to Delete"
                          onConfirm={() => {
                            deleteBanks.mutate(record.id);
                            message.success("Delete Successfully !!!");
                          }}
                          okText="Yes"
                          cancelText="No"
                        >
                          <div>
                            <Tag color="#f50">Delete</Tag>
                          </div>
                        </Popconfirm>
                      </Space>
                    )}
                  ></Column>
                </Table>
                <Tooltip placement="topLeft" title={"Add Bank Details"}>
                  <FloatButton
                    type="primary"
                    style={{ right: 80 }}
                    onClick={() => {
                      showBankDrawer();
                    }}
                    icon={<PlusCircleOutlined />}
                  />
                </Tooltip>
              </>
            ),
          },
          {
            key: "2",
            label: "My Products",
            icon: <TableOutlined />,

            children: (
              <>
                <Card
                  bordered={true}
                  hoverable
                  cover
                  title="Filter Details"
                  style={{ borderRadius: 10, marginBottom: 10 }}
                >
                  <Search
                    placeholder="E.g: Claimcode:123 /  Tillari"
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
                  <Select
                    allowClear
                    onClear={() => {
                      setBankId("");
                    }}
                    style={{ width: "30%", height: 40, marginLeft: 10 }}
                    placeholder="Select Bank"
                    onSelect={(i: string) => {
                      setBankId(i);
                    }}
                  >
                    {bank?.data.map((i: { name: string; id: string }) => {
                      return (
                        <Option key={i.id} value={i.id}>
                          {i.name}
                        </Option>
                      );
                    })}
                  </Select>
                </Card>

                <Table
                  loading={isLoading}
                  bordered
                  scroll={{ x: 140 }}
                  sticky
                  pagination={{
                    position: ["topRight"],
                    defaultPageSize: 7,
                    total: bankRecordsData?.data.count,
                  }}
                  onChange={(pagination) => {
                    setPagination({
                      page: +pagination.current!,
                      capacity: +pagination.defaultPageSize!,
                    });
                    // queryClient.refetchQueries("customersData");
                  }}
                  dataSource={bankRecordsData?.data.data}
                >
                  <Column
                    width={100}
                    title="S.N"
                    dataIndex={"id"}
                    render={(id) => (
                      <Tag color="orange">
                        {id.substring(0, id.indexOf("-"))}
                      </Tag>
                    )}
                  ></Column>
                  <Column
                    width={100}
                    title="Identity"
                    dataIndex={"identity"}
                    render={(_, data: YourDataItem) => (
                      <Tag color="Blue">{data.identity}</Tag>
                    )}
                  ></Column>
                  <Column
                    title="Bank Name"
                    dataIndex="Bank"
                    key={"bankname"}
                    render={(id) => <p>{id.name}</p>}
                  ></Column>
                  <Column
                    title="Product Name"
                    dataIndex="productName"
                    key={"product name"}
                  ></Column>
                  <Column
                    title="Claim Code"
                    dataIndex="claimCode"
                    key={"product name"}
                  ></Column>
                  <Column
                    width={150}
                    title="Kept Date"
                    dataIndex="bsDate"
                    key={"date"}
                  ></Column>
                  <Column
                    width={150}
                    title="Received Date"
                    dataIndex="updatedAt"
                    key={"Updateddate"}
                    render={(_, data: YourDataItem) => {
                      console.log(data);
                      if (data.status === "RECEIVED") {
                        return (
                          moment(data.updatedAt).format("YYYY-MM-DD") + "(AD)"
                        );
                      } else {
                        return "-";
                      }
                    }}
                  ></Column>

                  <Column
                    width={150}
                    title="Status"
                    dataIndex="status"
                    key={"status"}
                    render={(_, record: YourDataItem) => (
                      <Select
                        disabled={record?.status === "RECEIVED"}
                        value={record.status}
                        style={{ width: 120 }}
                        onChange={(value) =>
                          update.mutate(
                            {
                              bankId: record?.Bank?.id,
                              bankRecordId: record?.id,
                              data: {
                                status: value,
                              },
                            },
                            {
                              onSuccess: () => {
                                refetch();
                              },
                            }
                          )
                        }
                      >
                        <Option value="ON_Bank">ON_Bank</Option>
                        <Option value="RECEIVED">Received</Option>
                      </Select>
                    )}
                  ></Column>

                  <Column
                    width={150}
                    title="Action"
                    dataIndex="action"
                    key={"action"}
                    render={(_, record: BankRecordDataTypes) => (
                      <Space size="middle">
                        <Popconfirm
                          placement="topLeft"
                          title="Delete!!!"
                          description="Are You Sure Want to Delete"
                          onConfirm={() => {
                            deleteBankRecordDataMutation.mutate({
                              bankId: record.Bank.id,
                              bankRecordId: record?.id,
                            });
                          }}
                          okText="Yes"
                          cancelText="No"
                        >
                          <div>
                            <Tag color="#f50">Delete</Tag>
                          </div>
                        </Popconfirm>
                      </Space>
                    )}
                  ></Column>
                </Table>
                <Tooltip placement="topLeft" title={"Add Details"}>
                  <FloatButton
                    type="primary"
                    style={{ right: 80 }}
                    onClick={() => {
                      showRecordDrawer();
                    }}
                    icon={<PlusCircleOutlined />}
                  />
                </Tooltip>
              </>
            ),
          },
        ]}
      ></Tabs>

      <Drawer
        title="Add Bank Details"
        placement="right"
        onClose={onCloserecordDrawer}
        open={recordDrawerStatus}
        size="large"
        width={500}
        extra={
          <Space>
            <Button
              type="primary"
              onClick={handleModalSave}
              loading={loadingAddRecords}
            >
              Add Product Details
            </Button>
          </Space>
        }
      >
        <Form
          className="login-form"
          wrapperCol={{ span: 30 }}
          layout="horizontal"
          style={{ maxWidth: 700 }}
          form={form}
        >
          <Form.Item
            label="Bank Name"
            rules={[
              {
                required: true,
                message: "Please input your Bank Name!",
              },
            ]}
            name="bankId"
          >
            <Select placeholder="Drop Down to Select Bank">
              {bank?.data.map((i: { name: string; id: string }) => {
                return <Option value={i.id}>{i.name}</Option>;
              })}
            </Select>
          </Form.Item>

          <Form.Item
            label="Product Name"
            name="productName"
            rules={[
              {
                required: true,
                message: "Please input the details of product!",
              },
            ]}
          >
            <Input type="string" placeholder="E.g: Top" />
          </Form.Item>
          <Form.Item
            label="Claim Code"
            name="claimCode"
            rules={[{ required: true, message: "Please input the percentage" }]}
          >
            <Input type="string" placeholder="E.g: 123" />
          </Form.Item>
          <Form.Item
            label="Added Date"
            name="createdDate"
            rules={[
              {
                required: true,
                message: "Please input the Date of entry",
              },
            ]}
          >
            <Calendar
              locale={local}
              name="date"
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
        </Form>
      </Drawer>
      <Drawer
        title="Add Bank"
        placement="right"
        onClose={onCloseBankDrawer}
        open={bankDrawerStatus}
        size="large"
        width={500}
        extra={
          <Space>
            <Button
              type="primary"
              onClick={handleBankSave}
              loading={loadingAddBank}
            >
              Add Bank Details
            </Button>
          </Space>
        }
      >
        <Form
          className="login-form"
          wrapperCol={{ span: 30 }}
          layout="horizontal"
          style={{ maxWidth: 700 }}
          form={bankForm}
        >
          <Form.Item
            label="Bank Name"
            rules={[
              {
                required: true,
                message: "Please input your Bank Name!",
              },
            ]}
            name="name"
          >
            <Input type="string" placeholder="E.g: Nabil" />
          </Form.Item>

          <Form.Item
            label="Bank address"
            name="address"
            rules={[
              {
                required: true,
                message: "Please input the address of bank!",
              },
            ]}
          >
            <Input type="string" placeholder="E.g: Belbari" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
