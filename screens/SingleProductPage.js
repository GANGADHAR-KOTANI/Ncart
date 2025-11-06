import {useState, useEffect} from 'react';
import {Text,View,Image,ActivityIndicator,RefreshControl, TouchableOpacity,ScrollView, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';



// API URL for the single product
const FULL_PRODUCT_URL = 'https://selecto-project.onrender.com/api/user/singleproduct/6905aaed541acd02982db4d2';


export default function SingleProductPage(){
    // State variables
    const [product, setProduct] = useState(null);
    const [loading, setLoading] =useState(true);
    const [error,setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const [quantity, setQuantity] = useState(1);
    const[favourites,setFavourites] = useState(false);
    const [showDescription,setShowDescription] = useState(false);
    const [relatedProducts,setRelatedProducts] = useState([]);
    const [cartVisible,setCartVisible] = useState(false);
    
    //  Fetch product when page loads
    useEffect(()=>{
        fetchProduct();},[]);

    //  Function to fetch product
    const fetchProduct = async () => {
        try{
            setLoading(true);
            setError('');
            //call the product API
            const res = await fetch(FULL_PRODUCT_URL, {
                method:'GET',
                headers:{
                    Accept:"application/json",
                    }, 
            });
        
        //  Read raw text then parse JSON (safer for unexpected responses)
        const text = await res.text().catch(() => "");
        let data = text ? JSON.parse(text) : null;

        // If HTTP status not OK, throw the error so catch block handles it
        if (!res.ok) {
        throw new Error(`HTTP ${res.status} — ${JSON.stringify(data)}`);
         }
        
               
        // normalize / map API fields into predictable keys for UI
        const mapped={
            id: data?.product?._id,
            name:data?.product?.name ?? "",
            price:Number(data?.product?.price ?? 0),
            image: data?.product?.img
                    ? data.product.img
                    : "https://res.cloudinary.com/dsvthcxpk/image/upload/v1761979117/products/wtbq5vpqw6e9or6ipiys.jpg",
            description:data?.product?.description ?? "",
            rating:data?.product?.rating,
            category:data?.product?.category ?? "",
            shopName:data?.product?.sellerId?.shopName ?? "",
            };
        
        // Save mapped product to state so UI renders it
        setProduct(mapped);

        //  Call related products API based on the category
        if (mapped.category){
            fetchRelatedProducts(mapped.category);
        }

        } catch (err) {
        // handle network / parse / HTTP errors
        console.error("Fetch error:", err);
        setError(err.message);
        setProduct(null);
        } finally {
        // always stop the initial loader
        setLoading(false);
        } 
    };

        // pull-to-refresh handler
       const onRefresh = async () => {
        setRefreshing(true);
        await fetchProduct();
        setRefreshing(false);
       };


        //  Fetch related products using category API
        const fetchRelatedProducts = async (category) => {
            try {
                // Call sellers by category endpoint
                const response = await fetch(
                    `https://selecto-project.onrender.com/apis/category/${category}/sellers`
                    );

            const text = await response.text().catch(() => "");
            let data = text ? JSON.parse(text) : null;

            //  extract products 
            const products = data?.sellers?.[0]?.products ?? [];

            setRelatedProducts(products.slice(0, 11));  
        }   catch (error) {
            console.log("Related Products Error:", error);
        }
    };


        return( 
            <View style={{flex:1}}>

                {/* STORE NAME, BACK BUTTON, and SHARE BUTTON */}
                <View style={{flexDirection:'row',marginTop:55}}>
                    <TouchableOpacity onPress={() => console.log("Back button is pressed!")}>
                            <Ionicons name='chevron-back-outline' size={25} style={{marginLeft:15,marginRight:20,marginTop:5}}/>
                    </TouchableOpacity>
                    {product && (
                        <Text style={{fontSize:25,fontWeight:600,marginRight:170,}}>{product.shopName}</Text>   
                           )}  
                    <TouchableOpacity onPress={() => console.log("Share button is pressed!")}> 
                            <Ionicons name='share-outline' size={25} style={{marginRight:10}} />
                    </TouchableOpacity> 
                </View>
               
                 <ScrollView showsVerticalScrollIndicator={false}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

                 {loading && <ActivityIndicator size='large'/>} 
                    
                    {/* PRODUCT IMAGE */}
                    <View style={{flex:1,alignItems:'center',marginTop:5}}>  
                      {product && (
                            <Image 
                                source={{uri:product.image}} 
                                style={{height:260,width:350}} />  
                            )}
                        
                        {error !== "" && <Text style={{ color: "red" }}>{error}</Text>}    
                    </View>
               
               {/* PRODUCT NAME, RATING */}
                <View
                        style={{backgroundColor:'rgba(234, 234, 234, 1)',borderRadius:35,}}>

                    <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',marginTop:20,marginBottom:40}}>
                        {product && (
                            <Text style={{fontSize:24,fontWeight:'600',marginLeft:10}}>{product.name}</Text>
                        )}
                        {product &&(
                            <Text style={{marginLeft:30,marginRight:220,marginTop:10,fontSize:14}}>({product.rating})</Text>
                        )}
                        {/* FAVOURITES */}
                        <TouchableOpacity  onPress={() => setFavourites(!favourites)}>
                            <Ionicons name={favourites?"heart":"heart-outline"} color={favourites? "red":"black"} 
                                      size={24} />  
                        </TouchableOpacity>
                         
                    </View>
                    
                    {/* CHANGE QUANTITY */}
                    <View style={{flexDirection:'row',marginLeft:20,marginBottom:10}}>
                        <TouchableOpacity
                                 onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                                 style={{
                                 height: 40,
                                 width: 40,
                                 justifyContent: "center",
                                 alignItems: "center",
                                 color:'#B3B3B3', }}>
                                <Ionicons name="remove-outline" size={17} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 18, fontWeight: "600",borderWidth:2, borderColor:'#E2E2E2',borderRadius:12,width:35,height:35,paddingLeft:10,paddingTop:2 }}>
                            {quantity}
                        </Text>
                        <TouchableOpacity
                             onPress={() => setQuantity(quantity + 1)}
                             style={{
                             height: 40,
                             width: 40,
                             justifyContent: "center",
                             alignItems: "center",
                            }}>
                             <Ionicons name="add-outline" size={17}  color='#53B175' />
                        </TouchableOpacity>
                    
                    {/* PRODUCT PRICE */}
                    {product && (
                        <Text style={{fontSize:20,fontWeight:'600',marginLeft:200}}>Rs.{product.price}</Text>
                    )}
                    </View>
                    
                    <Text style={{marginLeft:30,borderBottomWidth:1,borderColor:'#E2E2E2B2',marginBottom:30,marginRight:20}}></Text>

                    {/* DESCRIPTION, NUTRITIONS, and REVIEWS */}
                    {product && (
                            <View>
                                <TouchableOpacity style={{flexDirection:'row',gap:240,marginLeft:30,}}
                                        onPress={() => setShowDescription(!showDescription)}>
                                <Text style={{fontSize:16,fontWeight:'600'}}>Description</Text>
                                <Ionicons
                                        name={showDescription ? "chevron-down-outline" : "chevron-forward-outline"}
                                        size={17}
                                        style={{ marginLeft: 6 }} />
                                </TouchableOpacity>

                                {showDescription && (
                                    <Text style={{marginLeft:30,fontSize:14,marginTop:10,marginRight:20}}>
                                        {product.description}
                                    </Text>
                                    )}
                            </View>
                    )} 

                    <Text style={{marginLeft:30,borderBottomWidth:1,borderColor:'#E2E2E2B2',marginBottom:20,marginRight:20}}></Text>

                    <TouchableOpacity style={{flexDirection:'row',gap:260,marginLeft:30,}}
                                    onPress={() => console.log("Nutritions")}>
                        <Text style={{fontSize:16,fontWeight:'600'}}>Nutritions</Text>
                        <Ionicons name='chevron-forward-outline' size={17} />
                    </TouchableOpacity>

                    <Text style={{marginLeft:30,borderBottomWidth:1,borderColor:'#E2E2E2B2',marginBottom:20,marginRight:20}}></Text>

                    <TouchableOpacity style={{flexDirection:'row',gap:280,marginLeft:30,marginBottom:30}}
                                    onPress={() => console.log("Review")}>
                        <Text style={{fontSize:16,fontWeight:'600'}}>Review</Text>
                        <Ionicons name='chevron-forward-outline' size={17} />
                    </TouchableOpacity>

                    {/* ADD TO CART and BUY NOW */}
                    <View style={{flexDirection:'row',gap:35,marginLeft:15,}}>
                        <TouchableOpacity
                            style={{backgroundColor:'#019344',height:43,width:176,borderRadius:19}}
                            onPress={() => setCartVisible(true)}>
                            <Text style={{fontSize:18,fontWeight:'600',color:'white',paddingLeft:42,paddingTop:8}}>Add to cart</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{borderWidth:1,borderColor:'#00000094',height:43,width:176,borderRadius:19,marginBottom:20}}
                            onPress={() => console.log("Buy Now button is pressed!")}>
                            <Text style={{fontSize:18,fontWeight:'600',color:'#019934',paddingLeft:53,paddingTop:8}}>Buy Now</Text>
                        </TouchableOpacity>
                    </View>

                    {/* RELATED PRODUCTS */}
                    <Text style={{marginLeft:20,fontSize:24,fontWeight:'600',marginTop:10}}>Related Products</Text>
                    <ScrollView style={{ marginLeft: 10, marginTop: 20 }} 
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingRight: 20 }}>

                                {relatedProducts.map((item) => (
                                    <View
                                        key={item._id}
                                        style={{
                                            width: 170,         
                                            padding: 8,
                                            borderRadius: 10,}}>
                                        <Image
                                            source={{uri: item.image?.[0] }}
                                            style={{
                                                width: "100%",
                                                height: 150,
                                                borderRadius: 10,
                                                backgroundColor:'white'}}/>
                                        <TouchableOpacity
                                            style={{
                                                position: 'absolute',
                                                top:8,
                                                left: '70%',
                                                backgroundColor: '#019934',
                                                borderRadius: 8,
                                                paddingVertical: 5,
                                                paddingHorizontal: 13,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                 }}>
                                            <Text style={{color:'white',fontSize:15,fontWeight:'500'}}>Add</Text>
                                        </TouchableOpacity>
                                        <Text style={{ fontSize: 15, fontWeight: "600", marginTop: 6 }}>
                                            {item.name}
                                        </Text>
                                        <Text style={{ fontSize: 14 }}>Rs.{item.price}</Text>
                                    </View>
                                    ))}
                                    {/* SEE ALL RELATED PRODUCTS */}
                                    <TouchableOpacity
                                        onPress={() => console.log("Go to full product list")}
                                        style={{
                                                justifyContent: 'center',
                                                paddingHorizontal: 10,
                                                paddingBottom:30
                                                         }}>
                                        <Ionicons name="chevron-forward-circle" size={30} color="rgba(194, 189, 189, 1)" />
                                    </TouchableOpacity>
                                    
                        </ScrollView> 

                </View>

            </ScrollView>

                    {/* VIEW CART BUTTON */}
                    {cartVisible && (
                            <View style={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: 60,
                                        width:"90%",
                                        marginBottom:25,
                                        marginLeft:20,
                                        backgroundColor: '#019934',
                                        justifyContent: "center",
                                        paddingLeft:20,
                                        borderRadius:20, }}>
                                <TouchableOpacity style={{flexDirection:'row',gap:230,}}>
                                    <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>
                                         View Cart
                                    </Text>
                                    <Ionicons name='chevron-forward-outline' size={24} style={{color:'white'}} />
                                </TouchableOpacity>
                            </View>
                        )}

            </View>
          
        );
        
    };
    
   


