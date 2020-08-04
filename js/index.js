// 匯入語系檔案
import zh_TW from './zh_TW.js';
// 加入至 VeeValidate 的設定檔案
VeeValidate.localize('tw', zh_TW);

// 將 VeeValidate input 驗證工具載入 作為全域註冊
Vue.component('ValidationProvider', VeeValidate.ValidationProvider);
// 將 VeeValidate 完整表單 驗證工具載入 作為全域註冊
Vue.component('ValidationObserver', VeeValidate.ValidationObserver);
// Class 設定檔案
VeeValidate.configure({
  classes: {
    valid: 'is-valid',
    invalid: 'is-invalid',
  }
});
// 掛載 Vue-Loading 套件
Vue.use(VueLoading);
// 全域註冊 VueLoading 並標籤設定為 loading
Vue.component('loading', VueLoading);

const app = new Vue({
  el: '#app',
  data: {
    apiPath: 'https://course-ec-api.hexschool.io/api/',
    uuid: '8997512c-2d60-40a2-b4a3-5240bcc586d0',
    token: '',
    products: [], // 裝回傳的所有資料
    tempProduct: {}, // 裝暫存資料
    pagination: {},
    isLoading: false,
    form: {
      name: '',
      email: '',
      tel: '',
      address: '',
      payment: '',
      message: '',
    },
    carts: [], // 陣列建議屬性名稱加上複數 s
    cartTotal: 0,
    status: {
      loadingItem: '', // loadingItem 給預設值，需預先定義，不然會出錯
    }
  },
  methods: {
    // 取得所有產品
    getAllProducts(nowPage = 1) {
      // 還沒取得資料時產生 loading 效果
      this.isLoading = true;
      // 宣告取得所有產品的 api
      const getApi = `${this.apiPath}${this.uuid}/ec/products?page=${nowPage}`;
      axios.get(getApi)
        .then(res => {
          this.products = res.data.data;
          this.pagination = res.data.meta.pagination;
          console.log(res);
          // 取得後移除 loading 效果
          this.isLoading = false;
        })
        .catch((error) => {
          // 取得後移除 loading 效果
          this.isLoading = false;
          console.log('失敗', error);
        })
    },

    // 取單一產品詳細資訊
    getDetailed(id) {
      // 點擊時將 id 帶入 loadingItem
      this.status.loadingItem = id;
      // 宣告取得單一產品的 api
      const url = `${this.apiPath}${this.uuid}/ec/product/${id}`;
      // AJAX
      axios.get(url).then(res => {
        // 將回傳資料放暫存區（因為會做數量的增減）
        // this.tempProduct = res.data.data;
        // 直接預設 num = 1
        // this.tempProduct.num = 1;

        // 以上兩行的進階寫法
        this.tempProduct = {
          ...res.data.data,
          num: 1,
        };

        // 或使用 $set
        // 因為 tempProduct 的 num 沒有預先定義，會導致雙向綁定失效
        // this.$set(this.tempProduct, 'num', 1);

        // 開啟 Modal
        $('#detailModal').modal('show');
        // 取得詳細資訊後 將 loadingItem 清空（loading 效果即消失）
        this.status.loadingItem = '';
      })
        .catch((error) => {
          console.log('失敗', error);
        })
    },

    // 加到購物車（post）
    addToCart(id, quantity = 1) { // 需代入 商品 id 及 商品數量（因為 api 文件上為 required）
      // quantity=1 參數預設值給 1（因為最少會加入 1 個產品，不會加 0 個）
      // 宣告新增某一筆購物車資料的 api
      const url = `${this.apiPath}${this.uuid}/ec/shopping`;
      // 還沒取得資料時的讀取效果
      this.isLoading = true;
      const cart = {
        product: id, // id 透過參數的方式代入
        quantity,    // quantity: quantity 的簡寫，數量也是透過參數的方式代入
      };
      // console.log(cart);  // 比對傳回來的值是否和文件一樣
      // AJAX 
      axios.post(url, cart) // （網址, 要傳送的物件）
        // 成功
        .then(res => {
          this.isLoading = false; // 移除 loading 效果
          $('#detailModal').modal('hide'); // 關閉 Modal
          console.log(res);
        })
        // 失敗
        .catch(error => {
          this.isLoading = false; // 移除 loading 效果
          console.log(error.response); // 回傳錯誤的訊息
          $('#detailModal').modal('hide'); // 關閉 Modal
        })
    },

    // 取出購物車的內容（get）
    getCart() {
      // 宣告取得購物車列表 api
      const url = `${this.apiPath}${this.uuid}/ec/shopping`;
      // 還沒取得資料時的讀取效果
      this.isLoading = true;
      // AJAX
      axios.get(url)
        .then(res => {
          this.isLoading = false; // 移除 loading 效果
          console.log(res);
          this.carts = res.data.data;
          // 購物清單的總計會出現無限累加的現象，
          // 最簡單的解決方法為「每次進行累加時，就清空 this.cartTotal = 0」
          this.cartTotal = 0;
          // 執行 updateTotal 累加總金額
          this.updateTotal();
        })
        // 失敗
        .catch(error => {
          this.isLoading = false; // 移除 loading 效果
          console.log(error.response); // 回傳錯誤的訊息
        })
    },

    // 總金額加總 拉出來寫成一個方法，這樣不論是增加或刪減才不會出錯
    updateTotal() {
      // 購物車金額加總
      this.carts.forEach(item => {
        this.cartTotal += item.product.price * item.quantity;
      });
    },

    // 更新購物車商品的數量
    updateQuantity(id, quantity) {
      // 宣告更新某一筆購物車資料 api
      const url = `${this.apiPath}${this.uuid}/ec/shopping`;
      // 還沒取得資料時的讀取效果
      this.isLoading = true;
      const cart = {
        product: id,
        quantity,
      }
      // AJAX
      axios.patch(url, cart)
        .then(res => {
          this.isLoading = false; // 移除讀取效果
          console.log(res);
          // 跑完之後要重新取得購物車資料
          this.getCart();
        })
        // 失敗
        .catch(error => {
          this.isLoading = false; // 移除 loading 效果
          console.log(error.response); // 回傳錯誤的訊息
        })
    },
  },
  // Vue 建立完成。資料 $data 已可取得時，即觸發以下方法 ( $el 屬性尚未被建立)。
  created() {
    this.getAllProducts(); // 取所有產品
    this.getCart();        // 取購物車內容
  },
});