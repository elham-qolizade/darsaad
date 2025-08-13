import React from "react";

const ProductItem = ({ title }) => {
  return (
    <li className="truncate text-gray-700 px-1">
      - {title}
    </li>
  );
};

export default ProductItem;
