import {FunctionComponent} from "react";
import {GoAButton} from "@abgov/react-components";
import styles from "./paging.module.scss";
import {selectedRoomSelector} from "./chat.slice";
import {useSelector} from "react-redux";

const displayClass = (isActive: boolean): string => {
  // hide the component unless a room has been loaded
  return styles.paging + (isActive ? " " + styles.active : "");
}

export const Paging: FunctionComponent = () => {
  const room = useSelector(selectedRoomSelector);
  const isActive = room !== undefined;

  return <div className={displayClass(isActive)}>
    <div>
      <div>
        <GoAButton buttonType="secondary" onClick={() =>
          console.log("toot!")
        }>
          Show More
        </GoAButton>
      </div>
    </div>
  </div>
}
