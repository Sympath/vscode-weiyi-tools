import TableRender from 'table-render';
import { AddAction } from './actions';
import { searchApi } from './request';
import { columns } from './table-schema';

export default () => {
  console.log('Config');
  return (
    <TableRender
      id="menu.application"
      toolbarRender={AddAction}
      pagination={{ pageSize: 20 }}
      columns={columns}
      request={searchApi}
    />
  );
};
