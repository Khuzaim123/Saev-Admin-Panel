import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

const PRODUCTS_COLLECTION = 'products';

export function useProducts() {
  const queryClient = useQueryClient();

  // Fetch all products
  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
  });

  // Fetch recent products (last 5)
  const { data: recentProducts = [] } = useQuery({
    queryKey: ['recentProducts'],
    queryFn: async () => {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
  });

  // Fetch single product
  const fetchProduct = async (id) => {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    throw new Error('Product not found');
  };

  // Add product mutation
  const addProduct = useMutation({
    mutationFn: async (productData) => {
      const data = {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), data);
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['recentProducts']);
    },
  });

  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: async ({ id, productData }) => {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await updateDoc(docRef, {
        ...productData,
        updatedAt: serverTimestamp(),
      });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['recentProducts']);
    },
  });

  // Delete product mutation
  const deleteProduct = useMutation({
    mutationFn: async (id) => {
      // Get product to delete image if exists
      const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, id));
      if (productDoc.exists()) {
        const productData = productDoc.data();
        if (productData.productImage && productData.productImage.includes('firebasestorage')) {
          try {
            const imageRef = ref(storage, `products/${id}/image`);
            await deleteObject(imageRef);
          } catch (err) {
            // Image might not exist, continue
            console.log('Image deletion skipped:', err.message);
          }
        }
      }
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['recentProducts']);
    },
  });

  // Upload image to Firebase Storage
  const uploadImage = async (productId, file) => {
    const storageRef = ref(storage, `products/${productId}/image`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  // Get product statistics
  const getProductStats = () => {
    const total = products.length;
    const active = products.filter((p) => p.isActive).length;
    const inactive = total - active;
    const stores = new Set(products.map((p) => p.storeName).filter(Boolean));
    const totalStores = stores.size;

    return { total, active, inactive, totalStores };
  };

  return {
    products,
    recentProducts,
    loading,
    fetchProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    getProductStats,
  };
}
