import { addDoc, collection, getDocs, getFirestore, DocumentData, QuerySnapshot, CollectionReference, query, where, QueryDocumentSnapshot, getDoc, doc } from 'firebase/firestore'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged  } from 'firebase/auth'
import { getAuth} from 'firebase/auth'
import {firestore} from './FirebaseConfig'
import React, { useState, ChangeEvent, useEffect } from "react"
import { useRouter } from 'next/router' 

import soreStyle from '../../../style/store.module.scss'

const Methods = () => {

  interface UserData {
    uuid: string | undefined,
    name: string | undefined,
    surname: string | undefined,
    email: string | undefined,
    password: string | undefined,
    street: string | undefined,
    houseNumber: string | undefined,
    city: string | undefined,
    postalCode: string | undefined,
    country: string | undefined,
}

    const db = getFirestore(firestore)
    const router = useRouter()
    const [searchingValue, setSearchingValue] = useState<string>('')
    const [searchResults, setSearchRelusts] = useState<DocumentData[] | undefined>([])
    const [valuesArray, setValuesArray] = useState<string[]>([''])
    const [user, setUser] = useState<UserData>()

    const $getAllDocuments = async (collectionName: string): Promise<QuerySnapshot> => {
        try {
            const collectionRef: CollectionReference  =  collection(db, collectionName)
            const querySnapshot = await getDocs(collectionRef)
            return querySnapshot
        }catch(err) {
            console.error(`Error: `, err)
            throw err
        }
    }

    const $search = async (collectionName: string, value: string): Promise<QuerySnapshot | null | undefined> => {
        try {
          const smallFirstLettervalue = value.charAt(0).toLowerCase() + value.slice(1)
          const collectionRef: CollectionReference = collection(db, collectionName)
      
          const queryName = query(collectionRef, where('name', 'array-contains', smallFirstLettervalue))
          const snapshotName = await getDocs(queryName)
      
      
          if (snapshotName.empty) {
            console.error('No documents match your criteria!!!')
            return null
          } else {
            return snapshotName
          }
        } catch (err) {
          console.error(`Error: `, err)
          throw err
        }
      }

      const $handleFilterCategory = async (value: string) => {
        try {
          const toLowerCaseName = value.toLowerCase()
          if(valuesArray.length > 1 && valuesArray.includes(toLowerCaseName)) {
            setValuesArray(prevEl => {
              return prevEl.filter(el => el !== toLowerCaseName)
            })
          }else{
            setValuesArray(prevEl => {return [...prevEl, toLowerCaseName]})
          }
        } catch (err) {
          console.error(`Error: `, err)
          throw err
        }
      }

      useEffect(() => {

        const fetchData = async () => {
          const collectionRef: CollectionReference = collection(db, 'products')
          const queryCategory = query(collectionRef, where('category', 'array-contains-any', valuesArray))
          const snapshotCategory = await getDocs(queryCategory)
          
          if (snapshotCategory.empty && valuesArray.length > 1) {
            console.error('No documents match your criteria!!!')
            setSearchRelusts(undefined)
            return null
          } else {
            setSearchRelusts(snapshotCategory.docs.map(el => el.data()))
          }
        }
        fetchData()
      }, [valuesArray])

      const $handleSearchResults = async (value: string) => {
        try {
          const query = await $search('products', value)
      
          if (query) {
            setSearchRelusts(query.docs.map(el => el.data()))
          } else {
            console.error('No documents match your criteria!!!')
            setSearchRelusts(undefined)
          }
        } catch (err) {
          console.error(`Error: `, err)
          throw err
        }
      }

    const $addNewDocument = async (collectionR: string, document: object) => {
        try {
            const collectionRef: CollectionReference<DocumentData> =  collection(db, collectionR)
            await addDoc(collectionRef, document)
                .then(doc => {
                    console.log(`success `, doc.id)
                })
        } catch (err) {
            console.error(`Error: `, err)
            throw err
        }
    }

    const $handleSearchingValue = (e: ChangeEvent<HTMLInputElement>) => {
        setValuesArray([''])
        setSearchingValue(e.target.value)
        return searchingValue
    }

    const $isUserLogged = (): Promise<boolean> => {
        const auth = getAuth(firestore)
    
        return new Promise((resolve, reject) => {
            onAuthStateChanged(auth, async user => {
                if (user) {
                  resolve(true)
                  const userCollection = collection(db, 'users')
                  const userQuery = query(userCollection, where('uuid', '==', user.uid))
                  const userSnapshot = await getDocs(userQuery)
                  if(!userSnapshot.empty){
                    userSnapshot.forEach(doc => {
                      setUser(doc.data() as UserData)
                    })
                  }
                } else {
                  resolve(false)
                  setUser(undefined)
                }
            }, err => {
                console.error(`ERROR: `, err)
                reject(err)
            })
        })
    }
    useEffect(() => {
      $isUserLogged()
    }, [])

    const $registrationUser = async (formData: DocumentData, ref: HTMLSpanElement):Promise<void> => {
        try {
            const auth = getAuth(firestore)
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
            const user = userCredential.user
            
            const userCollection = collection(db, 'users')

            const { password, ...userData } = formData

            await addDoc(userCollection, {
                uuid: user.uid,
                ...userData
            })
            ref.scrollIntoView({ behavior: 'smooth' })
            ref.innerHTML = 'Registration was successful, you will be automatically logged into your account immediately.'
            ref.classList.add(`${soreStyle.showFormMsg}`, `${soreStyle.success}`)
                setTimeout(() => {
                    ref.classList.remove(`${soreStyle.showFormMsg}`, `${soreStyle.success}`)
                    router.push('/store')
                }, 3500)
        } catch (err: any) {
            console.error(`ERROR: `, err)
        
            if (err && err.code) {
              const errorCode: string = err.code
        
              if (errorCode === 'auth/weak-password') {
                  console.error('The password is too weak!')
                  ref.scrollIntoView({ behavior: 'smooth' })
                  ref.innerHTML = 'The password is too weak!'
                  ref.classList.add(`${soreStyle.showFormMsg}`, `${soreStyle.error}`)
                  setTimeout(() => {
                      ref.classList.remove(`${soreStyle.showFormMsg}`, `${soreStyle.error}`)
                  }, 10000)
              } else if(errorCode === 'auth/email-already-in-use') {
                  ref.scrollIntoView({ behavior: 'smooth' })
                  console.error('E-mail address has already been used')
                  ref.innerHTML = 'E-mail address has already been used '
                  ref.classList.add(`${soreStyle.showFormMsg}`, `${soreStyle.error}`)
                  setTimeout(() => {
                      ref.classList.remove(`${soreStyle.showFormMsg}`, `${soreStyle.error}`)
                  }, 10000)
              } else {
                console.error(errorCode)
              }
            }
            throw err
          }
    }

    const $loginUser = async (formData: DocumentData, ref: HTMLSpanElement): Promise<void> => {
        try {
            const auth = getAuth(firestore)
            await signInWithEmailAndPassword(auth, formData.email, formData.password)
            router.push('/store')
        } catch (err: any) {
            console.error(`ERROR: `, err)
        
            if (err && err.code) {
              const errorCode: string = err.code
        
              if (errorCode === 'auth/invalid-credential') {
                console.error('Incorrect login credentials')
                ref.innerHTML = 'Incorrect login credentials'
                ref.classList.add(`${soreStyle.showFormMsg}`, `${soreStyle.error}`)
                setTimeout(() => {
                    ref.classList.remove(`${soreStyle.showFormMsg}`, `${soreStyle.error}`)
                }, 10000)
              } else {
                console.error(errorCode)
              }
            }
            throw err
          }
    }


    return {
        $getAllDocuments,
        $search,
        $addNewDocument,
        $handleSearchingValue,
        $handleSearchResults,
        $registrationUser,
        $isUserLogged,
        $loginUser,
        $handleFilterCategory,
        searchingValue,
        searchResults,
        valuesArray,
        user
    }
}

export default Methods