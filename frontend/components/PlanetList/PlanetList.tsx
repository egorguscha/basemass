import { useState } from "react"

export function PlanetList({ setPlanetSelected, planetsAvailable, planetSelected }) {
    return (
        <div className="planetsList">
            <h2 className="planetsList__title">YOUR <b>PLANETS:</b></h2>
            <ol className="planetsList__list">
            {planetsAvailable.length > 0 && 
                planetsAvailable.map((planet, index) => 
                    <li 
                        key={'planet' + planet.tokenId}
                        onClick={() => setPlanetSelected(index)} 
                        className={`planetsList__item ${index === planetSelected ? 'planetsList__item--active' : ''}`} 
                    >
                        { planet.name }
                    </li>)
            }
            {!planetsAvailable.length && 
                <li className="planetsList__text">
                    <a className="planetsList__link" href="https://www.fxhash.xyz/generative/25858">Mint new planet</a> or  buy it <br />
                    on <a className="planetsList__link" href="https://www.fxhash.xyz/marketplace/generative/25858">Marketplace</a>
                </li>
            }
            </ol>
        </div>
    )
}