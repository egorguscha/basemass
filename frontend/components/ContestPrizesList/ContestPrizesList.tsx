import React from 'react';

const CONTEST_PRIZES = [
    { place: '1st Place', reward: 200 },
    { place: '2nd Place', reward: 100 },
    { place: '3rd Place', reward: 50 },
    { place: '4–10th Places', reward: 15 },
];

export function ContestPrizesList() {
    return (
        <div className="prizes">
            <h2 className="prizes__title">CONTEST <span className='prizes__title--bold'>PRIZES:</span></h2>
            <ul className="prizes__list">
                {
                    CONTEST_PRIZES.map((contestPrize) => 
                        <li
                            key={`${contestPrize.place}-${contestPrize.reward}`}
                            className="prizes__item"
                        >
                            <span className='prizes__list--bold'>{ contestPrize.place }</span>
                            <span>{ contestPrize.reward } ETH</span>
                        </li>
                    )
                }
            </ul>
        </div>
    )
}