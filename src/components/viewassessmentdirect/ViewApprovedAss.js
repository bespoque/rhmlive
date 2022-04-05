import SectionTitle from "../section-title";
import Widget from "../widget";
import { SubmitButton } from "../CustomButton/CustomButton";
import { NewFormInput } from "../FormInput/formInputs";
import url from "../../config/url";
import setAuthToken from "../../functions/setAuthToken";
import { useEffect, useState } from "react";
import axios from "axios";
import { CustomPagination } from "../pagination/customPagination";
import { formatNumber } from "../../functions/numbers";
import dateformat from "dateformat";
import Loader from "react-loader-spinner";
import Widget1 from "../dashboard/widget-1";
import * as Icons from '../Icons/index';
import { ViewPendingTable } from "../tables/viewDirectAss";
import { ViewCompletedTable } from "../tables/viewCompletedDirect";
import { ViewApprovedTable } from "../tables/viewApprovedAss";

const ViewApprovedAss = () => {
  const [post, setPost] = useState(() => []);
  const [sum, setSum] = useState(() => null);
  const [totalemp, setTotalemp] = useState('');
  const [isFetching, setIsFetching] = useState(() => true);
  const [currentPage, setCurrentPage] = useState(() => 1);
  const [postPerPage, setPostPerPage] = useState(() => 10);
  const [year, setYear] = useState('');
  const [query, setQuery] = useState(() => "");
  useEffect(() => {
    setAuthToken();
    const fetchPost = async () => {
      try {
        let res = await axios.get(`${url.BASE_URL}forma/list-assessment?assmt=Approved` );
        res = res.data.body.assessmentApproved;
        console.log(res)
        let records = [];
        let sum = [];
        for (let i = 0; i < res.length; i++) {
          let rec = res[i];
          rec.taxPaidFormatted = formatNumber(rec.taxPaid)
          rec.gross_income = formatNumber(rec.gross_income)
          rec.taxPaidFormatted = formatNumber(rec.taxPaid)
          // rec.tax = formatNumber(rec.tax)
          rec.totalTaxFormated = formatNumber((Number(rec.add_assmt) + Number(rec.tax)))
          rec.totalTaxDue = (Number(rec.add_assmt) + Number(rec.tax))
          rec.balance = formatNumber(Number(rec.taxPaid) - Number(rec.totalTaxDue))
          rec.overallGross = formatNumber(Number(rec.employed) + Number(rec.self_employed) + Number(rec.other_income))
          rec.createtime = dateformat(rec.createtime, "dd mmm yyyy")
          records.push(rec);
        }
        setIsFetching(false);
        setPost(() => records);
      } catch (e) {
        setIsFetching(false);
        console.log(e.response);
      }
    };
    fetchPost();
  }, []);


  // Get current post
  const indexOfLastPost = currentPage * postPerPage;
  const indexOfFirstPost = indexOfLastPost - postPerPage;
  const currentPosts = post.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const next = (currentPage) => setCurrentPage(() => currentPage + 1);
  const previous = (currentPage) => setCurrentPage(() => currentPage - 1);

  const searchHandler = (e) => {
    setQuery(() => e.target.value);
  };

  let res = [];
  const search = (rows) => {
    let data = [];
    data = rows.filter((rows) => rows.kgtin.toLowerCase().indexOf(query) > -1);
    res.push(data);
    return data;
  };

  const searchedPost = search(post).slice(indexOfFirstPost, indexOfLastPost);
  // console.log(currentPosts);

  return (
    <>
      <SectionTitle title="View direct assessments" subtitle="View Approved Assessments" />

      {isFetching && (
        <div className="flex justify-center item mb-2">
          <Loader
            visible={isFetching}
            type="BallTriangle"
            color="#00FA9A"
            height={19}
            width={19}
            timeout={0}
            className="ml-2"
          />
          <p>Fetching data...</p>
        </div>
      )}
      <Widget>
        <div className="flex flex-col lg:flex-row lg:flex-wrap w-full lg:space-x-4">
          <div className="w-full lg:w-2/12">
            <NewFormInput
              label="Search by kgtin"
              required
              onChange={searchHandler}
            />
          </div>
        </div>

        <div className="mt-4">
          {query !== "" ? (
            <>
              <ViewApprovedTable remittance={searchedPost} />
              <CustomPagination
                paginate={paginate}
                totalPosts={res[0].length}
                postPerPage={postPerPage}
                currentPage={currentPage}
                next={next}
                previous={previous}
              />
            </>
          ) : (
            <>
              <ViewApprovedTable remittance={currentPosts} />
              <CustomPagination
                paginate={paginate}
                totalPosts={post.length}
                postPerPage={postPerPage}
                currentPage={currentPage}
                next={next}
                previous={previous}
              />
            </>
          )}
        </div>
      </Widget>
    </>
  );
};

export default ViewApprovedAss;
