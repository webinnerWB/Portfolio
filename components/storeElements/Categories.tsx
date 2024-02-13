import React, { useEffect, useState, FC } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Methods from '../services/DB/Methods'

import 'swiper/swiper-bundle.css';
import style from '../../style/store.module.scss'

const Categories: FC = () => {

  const [categories, setCategories] = useState<any>([])
  
  const getAllDocuments = Methods().$getAllDocuments

  const getCategories = async () => {
    try {
      const category = await getAllDocuments('categories')
      setCategories(category.docs.map(doc => doc.data()))
    } catch (err) {
      console.log(`Error: `, err)
    }
  }

  const slides = categories.map((el: any, index: number) => (
    <SwiperSlide className={`${style.slide}`} key={index} id={el.name}>
      <i className={`${el.icon} ${style.categoryIcon}`}></i>
      <h4>{el.name}</h4>
    </SwiperSlide>
  ))

  useEffect(() => {
    getCategories()
  }, [])

  // useEffect(() => {
  //   console.log(categories)
  // }, [categories])


    return (
     <>
       <h2 className={`${style.titleCategories}`}>Categories</h2>
      <Swiper 
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={50}
        loop={true}
        autoplay={{ delay: 3000 }}
        breakpoints={{
            1219: {slidesPerView: 5},
            600: {slidesPerView: 3},
            320: {slidesPerView: 1}

        }}
        className={`${style.swiperWrapper}`}
        >
          {slides}
      </Swiper>
     </>
    );
  };
  
  export default Categories;