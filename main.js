// ===== 1. DỮ LIỆU MẪU (mảng các object) =====
// status: "active" = Hoạt động | "locked" = Bị khóa | "pending" = Chờ duyệt
let users = [
  { id: 1, name: "Nguyễn Thị Lan",        email: "lan.nguyen@vl.demo", role: "Tình nguyện viên", status: "active" },
  { id: 2, name: "Quỹ Hạt Giống Xanh",    email: "org.xanh@vl.demo",   role: "Tổ chức xã hội",   status: "active" },
  { id: 3, name: "Trần Minh Quân",        email: "coord@vl.demo",      role: "Điều phối viên",   status: "active" },
  { id: 4, name: "Quản trị hệ thống (bạn)", email: "admin@vl.demo",    role: "Quản trị viên",    status: "active" },
];
let nextId = 5;
let editingId = null;
const statusText = { active: "Hoạt động", locked: "Bị khóa", pending: "Chờ duyệt" };
const userTable    = document.getElementById("userTable");
const emptyMsg     = document.getElementById("emptyMsg");
const searchInput  = document.getElementById("searchInput");
const roleFilter   = document.getElementById("roleFilter");
const statusFilter = document.getElementById("statusFilter");
const userModal  = document.getElementById("userModal");
const userForm   = document.getElementById("userForm");
const modalTitle = document.getElementById("modalTitle");
const nameInput  = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const roleInput  = document.getElementById("roleInput");
const nameError  = document.getElementById("nameError");
const emailError = document.getElementById("emailError");

function getFilteredUsers() {
  const keyword = searchInput.value.trim().toLowerCase();

  return users.filter(function (user) {
    const matchKeyword = user.name.toLowerCase().includes(keyword) ||
    user.email.toLowerCase().includes(keyword);
    const matchRole   = roleFilter.value === ""   || user.role === roleFilter.value;
    const matchStatus = statusFilter.value === "" || user.status === statusFilter.value;
    return matchKeyword && matchRole && matchStatus;
  });
}

// ===== 4. HÀM TẠO CÁC NÚT THAO TÁC cho 1 người dùng =====
function buildActions(user) {
  let html = "";

  if (user.status === "pending") {
    html += '<button class="btn btn--primary" data-action="approve">Phê duyệt</button>';
  }
  html += '<button class="btn" data-action="edit">Sửa</button>';

  if (user.role !== "Quản trị viên") {
    if (user.status === "locked") {
      html += '<button class="btn" data-action="toggle-lock">Mở khóa</button>';
    } else if (user.status === "active") {
      html += '<button class="btn btn--danger" data-action="toggle-lock">Khóa</button>';
    }
  }
  html += '<button class="btn" data-action="reset">Đặt lại MK</button>';
  return html;
}

function render() {
  const list = getFilteredUsers();
  let html = "";

  list.forEach(function (user) {
    html += `
      <tr data-id="${user.id}">
        <td><strong>${user.name}</strong><small>${user.email}</small></td>
        <td>${user.role}</td>
        <td><span class="status status--${user.status}">${statusText[user.status]}</span></td>
        <td><div class="actions">${buildActions(user)}</div></td>
      </tr>`;
  });

  userTable.innerHTML = html;
  emptyMsg.hidden = list.length > 0;
}

// ===== 6. SỰ KIỆN TÌM KIẾM & LỌC =====
searchInput.addEventListener("input", render);
roleFilter.addEventListener("change", render);
statusFilter.addEventListener("change", render);

// ===== 7. SỰ KIỆN CLICK CÁC NÚT TRONG BẢNG =====
// Chỉ gắn 1 sự kiện cho cả bảng, rồi xem người dùng bấm nút nào (data-action)
userTable.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) return;

  const id = Number(button.closest("tr").dataset.id);
  const user = users.find(function (u) { return u.id === id; });
  const action = button.dataset.action;

  if (action === "approve") {
    user.status = "active";
  } else if (action === "toggle-lock") {
    user.status = user.status === "locked" ? "active" : "locked";
  } else if (action === "edit") {
    openModal(user);
    return;
  } else if (action === "reset") {
    alert("Đã gửi email đặt lại mật khẩu tới " + user.email);
    return;
  }
  render();
});

// ===== 8. MODAL: MỞ / ĐÓNG =====
function openModal(user) {
  nameError.textContent = "";
  emailError.textContent = "";

  if (user) {                       // chế độ SỬA
    editingId = user.id;
    modalTitle.textContent = "Sửa người dùng";
    nameInput.value = user.name;
    emailInput.value = user.email;
    roleInput.value = user.role;
  } else {                          // chế độ TẠO MỚI
    editingId = null;
    modalTitle.textContent = "Tạo người dùng";
    userForm.reset();
  }
  userModal.hidden = false;
}

function closeModal() {
  userModal.hidden = true;
}

document.getElementById("btnCreate").addEventListener("click", function () { openModal(null); });
document.getElementById("btnCancel").addEventListener("click", closeModal);
userModal.addEventListener("click", function (event) {
  if (event.target === userModal) closeModal();   // bấm ra nền tối thì đóng
});

// ===== 9. KIỂM TRA FORM (validation) & LƯU =====
userForm.addEventListener("submit", function (event) {
  event.preventDefault();   // chặn trình duyệt tải lại trang

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  let valid = true;

  nameError.textContent = "";
  emailError.textContent = "";

  if (name === "") {
    nameError.textContent = "Vui lòng nhập tên.";
    valid = false;
  }

  if (email === "") {
    emailError.textContent = "Vui lòng nhập email.";
    valid = false;
  } else if (!email.includes("@") || !email.includes(".")) {
    emailError.textContent = "Email không hợp lệ.";
    valid = false;
  } else {
    // Email không được trùng với người khác
    const duplicated = users.some(function (u) {
      return u.email === email && u.id !== editingId;
    });
    if (duplicated) {
      emailError.textContent = "Email này đã tồn tại.";
      valid = false;
    }
  }

  if (!valid) return;   // có lỗi thì dừng, không lưu

  if (editingId === null) {
    // Thêm mới
    users.push({ id: nextId++, name: name, email: email, role: roleInput.value, status: "active" });
  } else {
    // Cập nhật
    const user = users.find(function (u) { return u.id === editingId; });
    user.name = name;
    user.email = email;
    user.role = roleInput.value;
  }

  closeModal();
  render();
});

// ===== 10. CHẠY LẦN ĐẦU =====
render();
