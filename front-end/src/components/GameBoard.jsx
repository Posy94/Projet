import React from "react";
import PropTypes from 'prop-types';
import ChoiceButton from './ChoiceButton';

const GameBoard = ({ items, onItemClick, columns = 4 }) => {
    return (
        <div
            className={`grid gap-4 p-4`}
            style={{
                gridTemplateColumns: `repeat(${coluimns}, minmax(0, 1fr))`,
            }}
        >
            {items.map((item, index) => (
                <ChoiceButton
                    key={index}
                    label={item.label}
                    onClick={() => onItemClick(item, index)}
                    selected= {item.selected}
                    disabled={item.disabled}
                />
            ))}
        </div>
    );
};

GameBoard.propTypes = {
    items: PropTypes.arrayOf(
        propTypes.shape({
            label: PropTypes.string.isRequired,
            selected: PropTypes.bool,
            disabled: PropTypes.bool,
        })
    ).isRequired,
    onItemClick: PropTypes.func.isRequired,
    columns: PropTypes.number,
};

export default GameBoard;