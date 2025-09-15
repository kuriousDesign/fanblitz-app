import * as React from "react";
import { useState } from "react";
import { Reorder } from "framer-motion";
import { Item } from "./Item";

const initialItems = ["🍅", "_", "_", "_"];

export default function FootballPickerComponent() {
  const [items, setItems] = useState(initialItems);

  return (
    <div >
      <Reorder.Group axis="x" onReorder={setItems} values={items} className='h-40 w-full flex flex-row items-center justify-center bg-amber-200'>
        {items.map((item, index) => (
          <Item key={index} item={item} />
        ))}
      </Reorder.Group>
    </div>
  );
}
