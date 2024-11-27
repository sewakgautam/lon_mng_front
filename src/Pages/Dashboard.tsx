import { useEffect, useState } from "react";
// import styles from "./Body.module.css";
// import { useLocation } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  Statistic,
  Table,
  Tag,
  TimeRangePickerProps,
} from "antd";

import { useQuery } from "react-query";
import {
  PaginationType,
  fetchCustomerHistory,
  fetchDashboard,
  fetchUsers,
  sessionUser,
} from "../utils/bridge";
import {
  MAINTAINANCE_MESSAGE,
  SERVER_MAINTAINACE,
  WIN_UPDATE_WARNING,
  color,
} from "../../config";
import dayjs, { Dayjs } from "dayjs";
import Column from "antd/es/table/Column";
// import CountUp from "react-countup";

// const formatter = (value: number) => <CountUp end={value} separator="," />;
// const queryClient = useQueryClient();

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<{
    totalCustomers: number;
    totalInterest: number;
    totalPrincipal: number;
    totalAuctioned: number;
  }>({
    totalCustomers: 0,
    totalPrincipal: 0,
    totalInterest: 0,
    totalAuctioned: 0,
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const Session: string | null = localStorage.getItem("session");
  const userSession = Session ? JSON.parse(Session) : null;

  const [historyData, setHistoryData] = useState<{
    customerId: string;
    startDate: Date;
    endDate: Date;
  }>({});

  const {
    data: dhittoHistory,
    isLoading: isLoadingTable,
    refetch,
  } = useQuery("dhittoHistory", () =>
    fetchCustomerHistory(historyData).then((res) => {
      return res;
    })
  );

  useEffect(() => {
    refetch();
  }, [historyData, refetch]);
  const { isLoading } = useQuery("dashboard", () =>
    fetchDashboard(userSession?.token).then((res) => {
      setDashboardData(res?.data);
      return res;
    })
  );

  const { data: userInformation } = useQuery("userInfo", () =>
    sessionUser(userSession?.token).then((res) => {
      return res;
    })
  );

  const { data: customers } = useQuery("customersData", () =>
    fetchUsers(userSession?.token, pagination, searchValue).then((res) => {
      return res;
    })
  );
  const { RangePicker } = DatePicker;
  // const onChange = (date: Dayjs) => {
  //   if (date) {
  //     console.log("Date: ", date);
  //   } else {
  //     console.log("Clear");
  //   }
  // };
  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    if (dates) {
      console.log("From: ", dates[0], ", to: ", dates[1]);
      console.log("From: ", dateStrings[0], ", to: ", dateStrings[1]);
    } else {
      console.log("Clear");
    }
  };

  const rangePresets: TimeRangePickerProps["presets"] = [
    { label: "Last 7 Days", value: [dayjs().add(-7, "d"), dayjs()] },
    { label: "Last 14 Days", value: [dayjs().add(-14, "d"), dayjs()] },
    { label: "Last 30 Days", value: [dayjs().add(-30, "d"), dayjs()] },
    { label: "Last 90 Days", value: [dayjs().add(-90, "d"), dayjs()] },
  ];

  const [pagination] = useState<PaginationType>({
    page: 1,
    capacity: 10,
  });
  const [searchValue] = useState<string>("");

  const firstNames = customers?.data.data?.map(
    (customer: { fullName: string; id: string }) => {
      const data = customer.fullName;
      return { value: customer.id, label: data };
    }
  );

  // form
  const [historyForm] = Form.useForm();
  // console.log(historyForm.getFieldsValue());

  const handleModelFilter = () => {
    historyForm
      .validateFields()
      .then(() => {
        const customerId = historyForm.getFieldsValue().customer;
        const startDate = new Date(historyForm.getFieldsValue().date[0]);
        const endDate = new Date(historyForm.getFieldsValue().date[1]);
        setHistoryData({ customerId, startDate, endDate });
      })
      .catch((error) => {
        console.error("Form validation failed:", error);
      });
  };

  return (
    <>
      {WIN_UPDATE_WARNING && (
        <Alert
          message="!!! Critical System Upgrade Required! !!!"
          description={`Welcome ${userInformation?.data.fullName} ! Unsupported Windows Detected,  Please upgrade your system soon to ensure uninterrupted service on Dashboard. For More Info Contact your system Developer !!! `}
          type="error"
          showIcon
          closable
        />
      )}

      {SERVER_MAINTAINACE && (
        <Alert
          message={MAINTAINANCE_MESSAGE.title}
          description={MAINTAINANCE_MESSAGE.description}
          type={MAINTAINANCE_MESSAGE.type}
          closable
          showIcon
        />
      )}
      <Row style={{ margin: 40 }} gutter={16}>
        <Col span={6}>
          <Card bordered={true} loading={loading} hoverable cover>
            <Statistic
              title="Total Customer"
              // formatter={formatter}
              loading={isLoading}
              value={dashboardData.totalCustomers}
              valueStyle={{ color: color.Primary }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={true} hoverable loading={loading}>
            <Statistic
              title="Total Principal Amount"
              // formatter={formatter}
              prefix="Rs."
              value={`${dashboardData.totalPrincipal}`}
              precision={2}
              loading={isLoading}
              valueStyle={{ color: color.Primary }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={true} hoverable loading={loading}>
            <Statistic
              title="Total Interest Amount"
              precision={2}
              // formatter={formatter}
              prefix="Rs."
              loading={isLoading}
              value={`${dashboardData.totalInterest}`}
              valueStyle={{ color: color.Primary }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={true} hoverable loading={loading}>
            <Statistic
              title="Total Auctioned"
              // formatter={formatter}
              loading={isLoading}
              value={`${dashboardData.totalAuctioned}`}
              valueStyle={{ color: color.Primary }}
            />
          </Card>
        </Col>
      </Row>
      <div>
        <Card
          bordered={true}
          style={{
            margin: 40,
            marginTop: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          hoverable
          loading={loading}
        >
          <h3>History</h3>

          <Form layout="vertical" form={historyForm}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="date"
                  label="Select Date"
                  rules={[
                    { required: true, message: "Please enter full name" },
                  ]}
                >
                  <RangePicker
                    presets={rangePresets}
                    onChange={onRangeChange}
                    disabledDate={(current) =>
                      current && current >= dayjs().endOf("day")
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="customer"
                  key={"customers"}
                  label="Customer Name"
                  rules={[
                    { required: true, message: "Please enter Customer Name" },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Search to Select"
                    optionFilterProp="label"
                    filterSort={(optionA, optionB) =>
                      (optionA?.label ?? "")
                        .toLowerCase()
                        .localeCompare((optionB?.label ?? "").toLowerCase())
                    }
                    options={firstNames}
                  />
                </Form.Item>
              </Col>

              <Col>
                <Form.Item name=" " label=" ">
                  <Button type="primary" onClick={handleModelFilter}>
                    Apply Filter
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Table
            loading={isLoadingTable}
            bordered
            sticky
            dataSource={
              dhittoHistory?.data?.map((item) => ({
                ...item.dhitto, // Assuming `item.dhitto` is the object you want for the row
              })) || []
            }
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
              width={100}
              sorter={true}
              title="Product Name"
              dataIndex={"productName"}
            />
            <Column
              width={100}
              sorter={true}
              title="Principal Amount"
              dataIndex={"principalAmount"}
            />
            <Column
              width={100}
              sorter={true}
              title="Loan Taken Date"
              dataIndex={"createdAt"}
            />
            <Column
              width={100}
              sorter={true}
              title="Status"
              dataIndex={"status"}
              render={(status) => (
                <Tag
                  color={
                    status === "SAFE"
                      ? "green"
                      : status === "LILAMI"
                      ? "red"
                      : "default"
                  }
                >
                  {status}
                </Tag>
              )}
            />
          </Table>
        </Card>

        {/* <span style="text-align:left">© <a href="https://www.ashesh.com.np/gold/" title="Gold Rates Nepal" target="_top" style="text-decoration:none;">Gold Rates Nepal</a></span> */}
      </div>

      {/* <Row style={{ margin: 40 }} gutter={16}>
        <Col span={17}>
          <Card>
            <Line options={options} data={data} />;
          </Card>
        </Col>
      </Row> */}
    </>
  );
}
