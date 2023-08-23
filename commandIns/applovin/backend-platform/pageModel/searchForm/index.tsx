import TableRender from "table-render";
import { AddAction } from "./actions";
import { searchApi } from "./request";
import { columns, searchFormSchema } from "./table-schema";

export default () => {
  return (
    <TableRender
      id="menu.condition"
      search={{ schema: searchFormSchema }}
      toolbarRender={AddAction()}
      pagination={{ pageSize: 20 }}
      columns={columns}
      request={searchApi}
    />
  );
};
