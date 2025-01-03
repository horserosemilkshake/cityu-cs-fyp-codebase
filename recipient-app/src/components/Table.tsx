import React, { FC } from 'react';

interface TableProps {
  data: { label: string; value: string }[];
}

const Table: FC<TableProps>  = ({data}) => {
  //   const data = [
  //     { label: 'Name', value: 'John Doe' },
  //     { label: 'Age', value: '35' },
  //     { label: 'Email', value: 'johndoe@example.com' },
  //     { label: 'Phone', value: '555-1234' },
  //   ];

  return (
    <div className="rounded-lg p-16">
      <table className="w-full">
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className={index === 0 ? '' : ''}>
              <td className="py-3 px-4 font-medium">{item.label}</td>
              <td className="py-3 px-4">{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;