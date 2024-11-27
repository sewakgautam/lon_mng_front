import { Image, Modal, Popconfirm, Space, Table, Tag, message } from "antd";
import Column from "antd/es/table/Column";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { deleteLilami, fetchLilami } from "../utils/bridge";
import { fetchStatements } from "../utils/statement.repo";
import moment from 'moment';

export default function Lilami() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dhitoId, setDhitoId] = useState<string>("");
  const [customerId, setCustomerId] = useState(0);

  const [pagination, setPagination] = useState<{
    page: number;
    capacity: number;
  }>({ page: 1, capacity: 5 });

  const [statementPagination, setStatementPagination] = useState<{
    page: number;
    capacity: number;
  }>({
    page: 1,
    capacity: 5,
  });

  type LilamiType = {
    dhitto: {
      customerId: number;
    };
  };

  const showModal = (id: string, data: LilamiType) => {
    setCustomerId(data.dhitto.customerId);
    setDhitoId(id);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const deleteLilamiDataMutation = useMutation(
    (lilamiId: string) => {
      return deleteLilami(lilamiId, userSession?.token);
    },
    {
      onSuccess: () => {
        message.success("Lilami Record Deleted !!!");
        queryClient.invalidateQueries(["lilamiData"]);
      },
    }
  );

  const Session: string | null = localStorage.getItem("session");
  const userSession = JSON.parse(Session ?? "");

  const {
    data: lilamiData,
    isLoading,
    refetch: refetchLilami,
  } = useQuery("lilamiData", () => fetchLilami(userSession?.token, pagination));

  const {
    data: statementsOfDhito,
    refetch,
    isLoading: isLilamiStatementLoading,
  } = useQuery(
    "lilamiSatements",
    () =>
      fetchStatements(
        customerId + "",
        dhitoId,
        userSession?.token,
        statementPagination
      ),
    {
      enabled: dhitoId != "",
      retry: dhitoId != "",
    }
  );

  useEffect(() => {
    refetch();
  }, [isModalOpen, refetch, statementPagination, dhitoId]);

  useEffect(() => {
    refetchLilami();
  }, [dhitoId, pagination, refetchLilami]);

  return (
    <>
      <div
        style={{
          padding: 20,
          minHeight: 380,
        }}
      >
        <Table
          loading={isLoading}
          scroll={{ x: 140 }}
          bordered
          sticky
          pagination={{
            position: ["topRight"],
            defaultPageSize: 5,
            total: lilamiData?.data.count,
          }}
          onChange={(pagination) => {
            setPagination({
              page: +pagination.current!,
              capacity: +pagination.defaultPageSize!,
            });
          }}
          dataSource={lilamiData?.data.data}
          style={{ marginTop: 10 }}
        >
          <Column
            width={80}
            sorter={true}
            title="Date of Collaps"
            dataIndex={"date"}
            key={"date"}
            render={(data) => {
              if (data.date == null) {
                return moment(data.createdAt).format("YYYY-MM-DD") + " (AD)";
              } else {
                return data.bsDate;
              }
            }}
          />
          <Column
            width={150}
            sorter={true}
            title="Client Name"
            key={"name"}
            dataIndex={"dhitto"}
            render={(data) => <p>{data.Customer.fullName}</p>}
          />
          <Column
            width={100}
            sorter={true}
            title="Item Details"
            dataIndex={"dhitto"}
            key={"studentId"}
            render={(data) => <p>{data.productName}</p>}
          />
          <Column
            width={70}
            sorter={true}
            title="Rate"
            dataIndex={"rate"}
            key={"studentId"}
          />
          <Column
            width={100}
            sorter={true}
            title="Evidence"
            key={"id"}
            dataIndex={"image"}
            render={(image) => (
              <Image
                src={image}
                style={{
                  verticalAlign: "middle",
                }}
              ></Image>
            )}
          />
          <Column
            width={100}
            sorter={true}
            title="Remarks"
            dataIndex={"remarks"}
            key={"id"}
          />
          <Column
            width={160}
            sorter={true}
            title="Action"
            key={"id"}
            render={(data) => (
              <Space size="middle">
                <Tag
                  color="#87d068"
                  onClick={() => showModal(data.dhittoId, data)}
                >
                  Statement
                </Tag>
                <Popconfirm
                  placement="topLeft"
                  title="Delete!!!"
                  description="Are You Sure Want to Delete"
                  onConfirm={() =>
                    deleteLilamiDataMutation.mutate(data.id, data)
                  }
                  okText="Yes"
                  cancelText="No"
                >
                  <div>
                    <Tag color="#f50">Delete</Tag>
                  </div>
                </Popconfirm>

                <Modal
                  width={1300}
                  title="Statement"
                  open={isModalOpen}
                  onOk={handleOk}
                  onCancel={handleCancel}
                >
                  <Table
                    scroll={{ x: 140 }}
                    loading={isLilamiStatementLoading}
                    bordered
                    sticky
                    dataSource={statementsOfDhito?.data?.data ?? []}
                    style={{ marginTop: 10 }}
                    pagination={{
                      total: statementsOfDhito?.data.count ?? 0,
                      defaultPageSize: statementPagination.capacity,
                      defaultCurrent: statementPagination.page,
                    }}
                    onChange={(pagination) => {
                      setStatementPagination((prev) => {
                        return {
                          ...prev,
                          page:
                            pagination.current! ?? pagination.defaultCurrent,
                        };
                      });
                    }}
                  >
                    <Column
                      width={100}
                      sorter={true}
                      title="Date"
                      dataIndex="bsDate"
                      key="date"
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
                  </Table>
                </Modal>
              </Space>
            )}
          />
        </Table>
      </div>
    </>
  );
}
