import React from "react";

const ProductItem = ({ title }) => {
  return (
    <div className="p-1">
        <div className="space-y-4">
    <li className="truncate text-gray-700">
      - {title}
    </li>
    </div>
    </div>
  );
};


  

export default ProductItem;
