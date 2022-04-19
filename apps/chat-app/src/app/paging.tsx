import {FunctionComponent} from "react";
import {GoAButton} from "@abgov/react-components";
import styles from "./paging.module.scss";
import {loadMore, selectedRoomSelector} from "./chat.slice";
import {useDispatch, useSelector} from "react-redux";

const displayClass = (isActive: boolean): string => {
  // hide the component unless a room has been loaded
  return styles.paging + (isActive ? " " + styles.active : "");
}

export const Paging: FunctionComponent = () => {
  const room = useSelector(selectedRoomSelector);
  const isActive = room !== undefined;
  const dispatch = useDispatch()

  return <div className={displayClass(isActive)}>
    <div>
      <div>
        <GoAButton buttonType="secondary" onClick={ () => { dispatch(loadMore()); console.log("loading More...") }}>
          Show More
        </GoAButton>
      </div>
    </div>
  </div>
}
