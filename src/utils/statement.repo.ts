import { AnyObject } from "antd/es/_util/type";
import { axiosInstance, PaginationType } from "./bridge";
import { xToken } from "../../config";

export async function deleteStatement(statementId: string, jwt: string) {
  return await axiosInstance.delete(`/statement/${statementId}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
}

export async function deleteStatementOfUser(
  customerId: string,
  dhitosId: string,
  statementId: string,
  jwt: string
) {
  return await axiosInstance.delete(
    `/customers/${customerId}/dhittos/${dhitosId}/statements/${statementId}?x-token=${xToken}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
}
export async function fetchStatements(
  userId: string,
  dhitoId: string,
  jwt: string,
  pagination: PaginationType
) {
  return await axiosInstance.get<{ count: number; data: AnyObject[] }>(
    `/customers/${userId}/dhittos/${dhitoId}/statements?page=${pagination.page}&capacity=${pagination.capacity}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
}
