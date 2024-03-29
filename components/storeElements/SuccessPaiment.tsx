import React, {useEffect, useState, FC} from "react"
import Link from "next/link"

import style from '../../style/store.module.scss'

type SucessPaiment = {
    amount: number,
    products: any[],
    status: string,
}

const SucessPaiment: FC<SucessPaiment> = ({ amount, products, status }: SucessPaiment) => {

    

    useEffect(() => {
        document.body.style.backgroundColor = '#161616'
        document.body.style.color = '#ffffff'
    }, [])

    const productsList = products.map((el, index) => (
        <tr  key={`${el.id}-${index}`} className={`${style.borderBottom}`}>
            <th scope="row" className={`${style.td}`}>    
                <div className={`d-lg-flex align-items-lg-center ${style.product}`}>
                    <img className={`${style.imgProduct}`} src={el.imgUrl} />
                    <p className={`${style.name}`}>{el.name}</p>
                </div>
            </th>
            <td className={`${style.td}`}>{el.unitPrice} PLN</td>
            <td className={`${style.td}`}>{el.quantity}</td>
            <td className={`${style.td}`}>{Number(el.quantity * (el.unitPrice)).toFixed(2)} PLN</td>
        </tr>
    ))
    
    return (
      <div className={style.paymentInfoWrapper}>
        <div className={style.info}>
            <h1>Payment status: {status}</h1><br/>
            <h2>Thank you for your purchase. <br/>Payment was successful, you can return to the home page</h2><br/>
            <h4>Total amount: {amount/100} PLN</h4>
            <br/>
            <Link href='/store'>
                <button className={`${style.backBtn} ${style.payment}`}>Back to shop</button>
            </Link>
        </div>
        <div className={`table-responsive ${style.tableWrapper}`}>
            <h2>Products</h2>
            <table className={`${style.tableCustom}`}>
                <thead>
                    <tr className={`${style.borderBottom}`}>
                        <th className={`${style.th}`} scope="col" >Products</th>
                        <th className={`${style.th} text-center`} scope="col">Price</th>
                        <th className={`${style.th} text-center`} scope="col">Quantity</th>
                        <th className={`${style.th} ${style.price} text-center`} scope="col">Total price for product</th>
                    </tr>
                </thead>
                <tbody className={`${style.productList}`}>
                    {productsList}
                </tbody>
            </table>
        </div>
      </div>
    )
}

export default SucessPaiment







